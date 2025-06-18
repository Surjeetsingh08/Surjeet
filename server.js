const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const tools = [
  {
    id: 1,
    name: "ChatGPT",
    category: "Writing",
    url: "https://chat.openai.com",
    excerpt: "Your AI Assistant for content creation",
    tags: ["AI Assistant", "Research", "Blog"]
  },
  {
    id: 2,
    name: "Midjourney",
    category: "Design",
    url: "https://midjourney.com",
    excerpt: "AI image generation tool",
    tags: ["Art", "Design", "Creative"]
  },
  {
    id: 3,
    name: "Grammarly",
    category: "Writing",
    url: "https://grammarly.com",
    excerpt: "AI-powered writing assistant",
    tags: ["Grammar", "Writing", "Editing"]
  },
  {
    id: 4,
    name: "DALL-E",
    category: "Design",
    url: "https://openai.com/dall-e-2",
    excerpt: "AI system that creates realistic images from text descriptions",
    tags: ["Art", "AI", "Image Generation"]
  },
  {
    id: 5,
    name: "Jasper",
    category: "Writing",
    url: "https://jasper.ai",
    excerpt: "AI content generator for marketing teams",
    tags: ["Marketing", "Content", "Copywriting"]
  }
];

let favorites = [];

// GET /api/tools - Returns AI tools with optional category filtering
app.get('/api/tools', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredTools = tools;
    
    if (category) {
      filteredTools = tools.filter(tool => 
        tool.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    res.json(filteredTools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/favorites - Add a tool to favorites
app.post('/api/favorites', (req, res) => {
  try {
    const { toolId } = req.body;
    
    // Validate request body
    if (!toolId || typeof toolId !== 'number') {
      return res.status(400).json({ 
        error: 'toolId is required and must be a number' 
      });
    }
    
    // Check if tool exists
    const tool = tools.find(t => t.id === toolId);
    if (!tool) {
      return res.status(404).json({ 
        error: 'Tool not found' 
      });
    }
    
    // Check for duplicate favorites
    const existingFavorite = favorites.find(fav => fav.toolId === toolId);
    if (existingFavorite) {
      return res.status(400).json({ 
        error: 'Tool is already in favorites' 
      });
    }
    
    // Add to favorites
    const newFavorite = {
      id: uuidv4(),
      toolId: toolId,
      addedAt: new Date().toISOString()
    };
    
    favorites.push(newFavorite);
    
    res.status(201).json({
      message: 'Tool added to favorites successfully',
      favorite: newFavorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/favorites - Get all favorites with tool details
app.get('/api/favorites', (req, res) => {
  try {
    const favoritesWithDetails = favorites.map(favorite => {
      const tool = tools.find(t => t.id === favorite.toolId);
      return {
        ...favorite,
        tool: tool || null
      };
    });
    
    res.json(favoritesWithDetails);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/favorites/:id - Remove a favorite
app.delete('/api/favorites/:id', (req, res) => {
  try {
    const favoriteId = req.params.id;
    
    const favoriteIndex = favorites.findIndex(fav => fav.id === favoriteId);
    
    if (favoriteIndex === -1) {
      return res.status(404).json({ 
        error: 'Favorite not found' 
      });
    }
    
    favorites.splice(favoriteIndex, 1);
    
    res.json({ 
      message: 'Favorite removed successfully' 
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    toolsCount: tools.length,
    favoritesCount: favorites.length
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 Tools API: http://localhost:${PORT}/api/tools`);
  console.log(`⭐ Favorites API: http://localhost:${PORT}/api/favorites`);
}); 