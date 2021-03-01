// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse, NextApiRequest } from 'next';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == 'POST') {
    const url = req.body.url;
    console.log(url);

    try {
      const info = await ytdl.getInfo(ytdl.getURLVideoID(url));
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${info.videoDetails.title}.mp3"`,
      );

      ytdl(url, { quality: 'highestaudio' }).pipe(res);
    } catch (err) {
      res.status(500).json(err);
      console.log(err.message);
    }
  } else {
    res.status(400);
  }
};
