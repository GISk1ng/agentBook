import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@clerk/nextjs/server'
import { MAX_FILE_SIZE } from '@/lib/constants'

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const pathname = formData.get('pathname') as string

        if (!file || !pathname) {
            return NextResponse.json({ error: 'Missing file or pathname' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large' }, { status: 400 })
        }

        const blob = await put(pathname, file, {
            access: 'private',
            token: process.env.agentbook_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        })

        return NextResponse.json(blob)
    } catch (e) {
        console.error('Upload error', e)
        const message = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
