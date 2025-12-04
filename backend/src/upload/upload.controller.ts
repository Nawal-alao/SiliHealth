import { Controller, Post, Options, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api')
export class UploadController {
  constructor(private prisma: PrismaService){}

  @Options('upload')
  async uploadOptions(@Res() res: FastifyReply) {
    res.status(200).send();
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  async upload(@Req() req: FastifyRequest & any, @Res() res: FastifyReply){
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    // Extract user ID from JWT token
    const userId = req.user?.id;
    if (!userId) {
      return { ok: false, error: 'User not authenticated' };
    }

    const saved: Array<{ filename:string, path:string }> = [];

    // fastify-multipart provides req.raw.multipart
    const raw = (req as any).raw;
    if(raw && raw.multipart){
      await new Promise((resolve, reject) => {
        raw.multipart(async (field, file, filename, encoding, mimetype) => {
          const dest = path.join(uploadsDir, `${Date.now()}-${filename}`);
          const ws = fs.createWriteStream(dest);
          file.pipe(ws);
          ws.on('finish', async () => {
            saved.push({ filename, path: `/uploads/${path.basename(dest)}` });
            try{ await (req as any).prisma?.upload?.create ? await (req as any).prisma.upload.create({ data:{ filename, path: `/uploads/${path.basename(dest)}`, uploadedBy: userId }}) : null; }catch(e){}
          });
        }, (err) => err ? reject(err) : resolve(null));
      });
    }

    // save metadata using Prisma
    const files = [] as any[];
    for(const s of saved){
      const rec = await this.prisma.upload.create({ data: { filename: s.filename, path: s.path, uploadedBy: userId } });
      files.push(rec);
    }

    return res.status(200).send({ ok:true, files });
  }
}
