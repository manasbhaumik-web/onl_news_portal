import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Article } from '../models/Article';

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a specific article room to listen for live view count updates
    socket.on('join:article', (slug: string) => {
      socket.join(`article:${slug}`);
    });

    // Leave the article room
    socket.on('leave:article', (slug: string) => {
      socket.leave(`article:${slug}`);
    });

    // Client explicitly sends a view event
    socket.on('view:article', async (slug: string) => {
      try {
        // Increment view count in MongoDB
        const article = await Article.findOneAndUpdate(
          { slug },
          { $inc: { viewCount: 1 } },
          { new: true }
        ).lean();

        if (article) {
          // Broadcast updated view count to all clients viewing this article
          io.to(`article:${slug}`).emit('view:count', { slug, viewCount: article.viewCount });
        }
      } catch (err) {
        console.error('Socket View Error:', err);
      }
    });

    // Admins emitting breaking news
    socket.on('emit:breaking', (data: { title: string; slug: string }) => {
      // In production, you would verify the socket belongs to an admin here
      socket.broadcast.emit('breaking:news', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
