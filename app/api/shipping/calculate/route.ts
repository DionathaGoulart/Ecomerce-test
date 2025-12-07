import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ShippingRequest {
  cepOrigin: string
  cepDestination: string
  weight: number // em kg
  length: number // em cm
  height: number // em cm
  width: number // em cm
}

/**
 * Calcula frete usando API dos Correios (CalcPrecoPrazo)
 * A API dos Correios é gratuita mas requer credenciais (usuário e senha)
 * Por enquanto, vamos usar uma implementação simplificada
 * 
 * Para usar a API oficial dos Correios, você precisa:
 * 1. Cadastrar-se no site dos Correios
 * 2. Obter usuário e senha para acesso à API
 * 3. Configurar as variáveis de ambiente
 */
export async function POST(request: NextRequest) {
  try {
    const body: ShippingRequest = await request.json()
    
    const { cepOrigin, cepDestination, weight, length, height, width } = body

    // Validar CEPs
    const cleanOrigin = cepOrigin.replace(/\D/g, '')
    const cleanDestination = cepDestination.replace(/\D/g, '')
    
    if (cleanOrigin.length !== 8 || cleanDestination.length !== 8) {
      return NextResponse.json(
        { error: 'CEPs inválidos' },
        { status: 400 }
      )
    }

    // Valores padrão se não fornecidos
    const finalWeight = weight || 0.5 // 500g padrão
    const finalLength = length || 20 // 20cm padrão
    const finalHeight = height || 10 // 10cm padrão
    const finalWidth = width || 15 // 15cm padrão

    // Tentar usar API dos Correios se tiver credenciais
    const correiosUser = process.env.CORREIOS_USER
    const correiosPassword = process.env.CORREIOS_PASSWORD

    if (correiosUser && correiosPassword) {
      try {
        // Usar API SOAP dos Correios
        const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CalcPrecoPrazo xmlns="http://tempuri.org/">
      <nCdEmpresa>${correiosUser}</nCdEmpresa>
      <sDsSenha>${correiosPassword}</sDsSenha>
      <nCdServico>04014</nCdServico>
      <sCepOrigem>${cleanOrigin}</sCepOrigem>
      <sCepDestino>${cleanDestination}</sCepDestino>
      <nVlPeso>${finalWeight}</nVlPeso>
      <nCdFormato>1</nCdFormato>
      <nVlComprimento>${finalLength}</nVlComprimento>
      <nVlAltura>${finalHeight}</nVlAltura>
      <nVlLargura>${finalWidth}</nVlLargura>
      <nVlDiametro>0</nVlDiametro>
      <sCdMaoPropria>N</sCdMaoPropria>
      <nVlValorDeclarado>0</nVlValorDeclarado>
      <sCdAvisoRecebimento>N</sCdAvisoRecebimento>
    </CalcPrecoPrazo>
  </soap:Body>
</soap:Envelope>`

        const response = await fetch('http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://tempuri.org/CalcPrecoPrazo',
          },
          body: soapBody,
        })

        if (response.ok) {
          const xmlText = await response.text()
          
          // Parse simples do XML (você pode usar uma biblioteca XML parser se preferir)
          const valorMatch = xmlText.match(/<Valor>([^<]+)<\/Valor>/)
          const prazoMatch = xmlText.match(/<PrazoEntrega>([^<]+)<\/PrazoEntrega>/)
          const erroMatch = xmlText.match(/<Erro>([^<]+)<\/Erro>/)
          
          if (erroMatch && erroMatch[1] !== '0') {
            // Se houver erro, usar cálculo simplificado
            throw new Error('Erro na API dos Correios')
          }
          
          if (valorMatch && prazoMatch) {
            const valor = parseFloat(valorMatch[1].replace(',', '.'))
            const prazo = parseInt(prazoMatch[1])
            
            // Converter valor para centavos
            const valorCents = Math.round(valor * 100)
            
            return NextResponse.json({
              cost: valorCents,
              days: prazo,
              service: 'PAC',
              source: 'correios',
            })
          }
        }
      } catch (error) {
        console.error('Erro ao usar API dos Correios:', error)
        // Continuar com cálculo simplificado
      }
    }

    // Cálculo simplificado baseado em distância/região (fallback)
    // Mesmo CEP: frete local
    if (cleanOrigin === cleanDestination) {
      return NextResponse.json({
        cost: 1000, // R$ 10,00
        days: 1,
        service: 'Local',
        source: 'estimated',
      })
    }

    // Buscar informações do CEP de destino
    try {
      const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanDestination}/json/`)
      const cepData = await cepResponse.json()

      if (cepData.erro) {
        throw new Error('CEP não encontrado')
      }

      // CEP origem (empresa) - São Paulo
      const originState = 'SP'
      const originCity = 'São Paulo'

      // Calcular baseado em região
      let cost = 0
      let days = 5

      if (cepData.uf === originState) {
        if (cleanDestination.startsWith('0')) {
          // Região metropolitana de SP
          cost = 1500 // R$ 15,00
          days = 2
        } else {
          // Estado de SP (fora da região metropolitana)
          cost = 2000 // R$ 20,00
          days = 3
        }
      } else {
        // Outros estados
        cost = 3000 // R$ 30,00
        days = 5
      }

      // Ajustar baseado no peso (adicionar 10% por kg extra)
      if (finalWeight > 1) {
        const extraWeight = finalWeight - 1
        cost += Math.round(cost * 0.1 * extraWeight)
      }

      return NextResponse.json({
        cost,
        days,
        service: 'PAC Estimado',
        source: 'estimated',
      })
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      
      // Valor padrão se não conseguir calcular
      return NextResponse.json({
        cost: 2000, // R$ 20,00
        days: 5,
        service: 'PAC Estimado',
        source: 'estimated',
      })
    }
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular frete' },
      { status: 500 }
    )
  }
}

