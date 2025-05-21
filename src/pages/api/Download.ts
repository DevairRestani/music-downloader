// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse, NextApiRequest } from 'next';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg'; // Still unused, kept as per instructions

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const originalUrl = req.body.url;
    console.log('Received original URL:', originalUrl);

    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ message: 'Invalid URL provided.' });
    }

    try {
      let videoId;
      try {
        videoId = ytdl.getVideoID(originalUrl);
      } catch (e) {
        console.error('Failed to get video ID:', e.message);
        return res.status(400).json({ message: `Invalid YouTube URL format: ${e.message}` });
      }
      
      const cleanVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log('Processing with clean URL:', cleanVideoUrl);

      const info = await ytdl.getInfo(cleanVideoUrl);
      // Sanitize filename: replace characters that are problematic in filenames
      const sanitizedTitle = info.videoDetails.title.replace(/[<>:"/\\|?*]+/g, '_');
      
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedTitle}.mp3"`,
      );
      res.setHeader('Content-Type', 'audio/mpeg'); // Set appropriate MIME type

      ytdl(cleanVideoUrl, { quality: 'highestaudio' })
        .on('error', (err) => {
          // Handle errors during streaming
          console.error('Error during ytdl stream:', err.message);
          // Important: If headers are already sent, you can't send a new JSON response.
          // Best to destroy the response stream if possible.
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error during audio stream.' });
          } else {
            // If headers are sent, it's harder to signal error cleanly.
            // Destroying the stream can help client realize download failed.
            res.destroy();
          }
        })
        .pipe(res);

    } catch (err) {
      console.error('Error in ytdl processing:', err.message, err.stack); // Log the full error for server-side debugging
      // Check if headers have already been sent before trying to send a JSON response
      if (!res.headersSent) {
        let errorMessage = 'Failed to process video.';
        if (err.message.includes('No such video')) {
          errorMessage = 'Video not found or access denied.';
        } else if (err.message.includes('age-restricted')) {
            errorMessage = 'Video is age-restricted and cannot be accessed.';
        }
        // Add more specific error messages based on ytdl-core common errors if possible
        res.status(500).json({ message: errorMessage });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
};
