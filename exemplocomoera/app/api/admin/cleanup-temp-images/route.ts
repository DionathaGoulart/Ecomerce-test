import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * Limpa imagens temporárias expiradas (mais de 5 minutos)
 * Deve ser chamado periodicamente (cron job ou similar)
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas admins podem limpar imagens temporárias.' },
        { status: 403 }
      )
    }

    // Listar todos os arquivos no diretório temp/
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('personalizations')
      .list('temp', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      })

    if (listError) {
      console.error('Erro ao listar arquivos temporários:', listError)
      return NextResponse.json(
        { error: 'Erro ao listar arquivos temporários', details: listError.message },
        { status: 500 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma imagem temporária encontrada',
        deleted: 0,
      })
    }

    // Filtrar arquivos expirados (mais de 5 minutos)
    const now = new Date()
    const expiredFiles: string[] = []

    for (const file of files) {
      // Verificar metadata
      const metadata = file.metadata as { isTemporary?: string; expiresAt?: string } | null
      
      if (metadata?.isTemporary === 'true' && metadata.expiresAt) {
        const expiresAt = new Date(metadata.expiresAt)
        if (expiresAt < now) {
          expiredFiles.push(`temp/${file.name}`)
        }
      } else {
        // Se não tem metadata, verificar pela data de criação (fallback: 10 minutos)
        const createdAt = new Date(file.created_at)
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
        if (createdAt < tenMinutesAgo) {
          expiredFiles.push(`temp/${file.name}`)
        }
      }
    }

    if (expiredFiles.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma imagem temporária expirada encontrada',
        deleted: 0,
      })
    }

    // Deletar arquivos expirados
    const { data: deletedFiles, error: deleteError } = await supabaseAdmin.storage
      .from('personalizations')
      .remove(expiredFiles)

    if (deleteError) {
      console.error('Erro ao deletar arquivos temporários:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar arquivos temporários', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${expiredFiles.length} imagem(ns) temporária(s) expirada(s) deletada(s)`,
      deleted: expiredFiles.length,
      files: deletedFiles,
    })
  } catch (error) {
    console.error('Erro ao limpar imagens temporárias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

