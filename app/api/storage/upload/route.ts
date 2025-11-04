import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `personalizations/${fileName}`

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload usando supabaseAdmin (service role, bypassa RLS)
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('personalizations')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem', details: uploadError.message },
        { status: 500 }
      )
    }

    // Criar signed URL válida por 1 ano
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('personalizations')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 ano

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
    })
  } catch (error) {
    console.error('Erro ao processar upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
