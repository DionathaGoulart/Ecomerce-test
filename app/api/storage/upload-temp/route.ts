import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Upload temporário de imagens de personalização
 * As imagens são marcadas como temporárias e expiram em 5 minutos
 * Quando o pedido é criado, a imagem é copiada para permanente
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas imagens são permitidas' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 5MB' },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `temp_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `temp/${fileName}`

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Calcular timestamp de expiração (5 minutos)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // Upload usando supabaseAdmin (service role, bypassa RLS)
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('personalizations')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '300', // 5 minutos
        upsert: false,
        metadata: {
          isTemporary: 'true',
          expiresAt,
          uploadedAt: new Date().toISOString(),
        },
      })

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem', details: uploadError.message },
        { status: 500 }
      )
    }

    // Criar signed URL válida por 10 minutos (mais que os 5 minutos de expiração)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('personalizations')
      .createSignedUrl(filePath, 60 * 10) // 10 minutos

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Erro ao criar signed URL:', signedUrlError)
      return NextResponse.json(
        { error: 'Erro ao criar URL da imagem', details: signedUrlError?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      path: filePath,
      expiresAt,
    })
  } catch (error) {
    console.error('Erro ao processar upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

