import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface ShippingRequest {
  cepOrigin?: string // Opcional - a API usa o CEP do banco de dados
  cepDestination: string
  weight: number // em kg
  length: number // em cm
  height: number // em cm
  width: number // em cm
}

/**
 * Calcula frete usando configurações do banco de dados
 */
export async function POST(request: NextRequest) {
  try {
    const body: ShippingRequest = await request.json()
    
    const { cepDestination, weight } = body

    // Buscar configurações gerais (incluindo CEP de origem)
    const { data: settings } = await supabaseAdmin
      .from('shipping_settings')
      .select('*')
      .single()

    // Usar CEP de origem do banco de dados
    const originCEP = settings?.origin_cep || '01310100'
    const cleanOrigin = originCEP.replace(/\D/g, '')
    const cleanDestination = cepDestination.replace(/\D/g, '')
    
    if (cleanOrigin.length !== 8 || cleanDestination.length !== 8) {
      return NextResponse.json(
        { error: 'CEPs inválidos' },
        { status: 400 }
      )
    }

    // Valores padrão se não fornecidos
    const finalWeight = weight || 0.5 // 500g padrão

    const originState = settings?.origin_state || 'SP'

    // Buscar configurações de frete do banco de dados
    const { data: configs } = await supabaseAdmin
      .from('shipping_configs')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    // Mesmo CEP: frete local
    if (cleanOrigin === cleanDestination) {
      const sameCepConfig = configs?.find((c) => c.region_type === 'same_cep')
      if (sameCepConfig) {
        let cost = sameCepConfig.base_cost_cents
        // Aplicar multiplicador de peso se necessário
        if (finalWeight > sameCepConfig.min_weight_kg && sameCepConfig.weight_multiplier > 0) {
          const extraWeight = finalWeight - sameCepConfig.min_weight_kg
          cost += Math.round(cost * sameCepConfig.weight_multiplier * extraWeight)
        }
        return NextResponse.json({
          cost,
          days: sameCepConfig.delivery_days,
          service: 'Local',
          source: 'database',
        })
      }
    }

    // Buscar informações do CEP de destino
    try {
      const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanDestination}/json/`)
      const cepData = await cepResponse.json()

      if (cepData.erro) {
        throw new Error('CEP não encontrado')
      }

      // Tentar encontrar configuração correspondente
      let matchedConfig = null

      // Ordenar por prioridade (maior primeiro)
      const sortedConfigs = (configs || []).sort((a, b) => b.priority - a.priority)

      for (const config of sortedConfigs) {
        let matches = false

        switch (config.region_type) {
          case 'same_cep':
            matches = cleanOrigin === cleanDestination
            break
          case 'metro_sp':
            matches =
              cepData.uf === originState &&
              config.state_code === originState &&
              cleanDestination.startsWith(config.cep_prefix || '0')
            break
          case 'sp_state':
            matches = cepData.uf === originState && config.state_code === originState
            break
          case 'other_states':
            matches = cepData.uf !== originState
            break
          case 'custom':
            // Verificar se estado corresponde
            if (config.state_code) {
              matches = cepData.uf === config.state_code
            } else {
              matches = true // Se não tem estado específico, aceita qualquer um
            }
            // Verificar prefixo de CEP se especificado
            if (config.cep_prefix && matches) {
              matches = cleanDestination.startsWith(config.cep_prefix)
            }
            break
        }

        if (matches) {
          matchedConfig = config
          break
        }
      }

      // Se encontrou configuração, usar ela
      if (matchedConfig) {
        let cost = matchedConfig.base_cost_cents

        // Aplicar multiplicador de peso se necessário
        if (finalWeight > matchedConfig.min_weight_kg && matchedConfig.weight_multiplier > 0) {
          const extraWeight = finalWeight - matchedConfig.min_weight_kg
          cost += Math.round(cost * matchedConfig.weight_multiplier * extraWeight)
        }

        return NextResponse.json({
          cost,
          days: matchedConfig.delivery_days,
          service: matchedConfig.name,
          source: 'database',
        })
      }

      // Se não encontrou configuração, usar valores padrão
      const defaultCost = settings?.default_cost_cents || 2000
      const defaultDays = settings?.default_delivery_days || 5

      // Aplicar multiplicador padrão de 10% por kg extra
      let cost = defaultCost
      if (finalWeight > 1) {
        const extraWeight = finalWeight - 1
        cost += Math.round(cost * 0.1 * extraWeight)
      }

      return NextResponse.json({
        cost,
        days: defaultDays,
        service: 'PAC Estimado',
        source: 'default',
      })
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      
      // Valor padrão se não conseguir calcular
      const defaultCost = settings?.default_cost_cents || 2000
      const defaultDays = settings?.default_delivery_days || 5

      return NextResponse.json({
        cost: defaultCost,
        days: defaultDays,
        service: 'PAC Estimado',
        source: 'default',
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

