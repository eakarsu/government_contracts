const { QdrantClient } = require('@qdrant/qdrant-js');
const crypto = require('crypto');

class VectorDbService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      checkCompatibility: false,
    });
    this.collectionName = process.env.QDRANT_COLLECTION || 'contracts';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        // Create collection
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 384, // Sentence-transformers dimension
            distance: 'Cosine'
          }
        });
        console.log(`Created collection: ${this.collectionName}`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Vector DB initialization error:', error);
      throw error;
    }
  }

  async indexContract(contract) {
    await this.initialize();

    try {
      // Prepare text for embedding
      const text = this.prepareContractText(contract);
      
      // Get embedding from AI service
      const embedding = await this.getEmbedding(text);

      // Prepare payload
      const payload = {
        contract_id: contract._id.toString(),
        title: contract.title,
        agency: contract.department,
        notice_id: contract.noticeId,
        posted_date: contract.postedDate,
        response_deadline: contract.responseDeadline,
        naics_code: contract.naicsCode,
        set_aside: contract.setAside
      };

      // Upsert to Qdrant
      await this.client.upsert(this.collectionName, {
        points: [{
          id: this.generatePointId(contract._id.toString()),
          vector: embedding,
          payload: payload
        }]
      });

      console.log(`Indexed contract: ${contract.noticeId}`);
      return true;
    } catch (error) {
      console.error('Error indexing contract:', error);
      throw error;
    }
  }

  async searchContracts(query, limit = 20) {
    await this.initialize();

    try {
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);

      // Search in Qdrant
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: limit,
        with_payload: true
      });

      // Transform results
      return searchResult.map(result => ({
        id: result.payload.contract_id,
        score: result.score,
        title: result.payload.title,
        agency: result.payload.agency,
        noticeId: result.payload.notice_id
      }));
    } catch (error) {
      console.error('Error searching contracts:', error);
      throw error;
    }
  }

  async storeDocument(doc) {
    await this.initialize();

    try {
      const embedding = await this.getEmbedding(doc.text);
      const pointId = this.generatePointId(`${doc.contractId}_${doc.documentName}`);

      await this.client.upsert(this.collectionName, {
        points: [{
          id: pointId,
          vector: embedding,
          payload: {
            contract_id: doc.contractId,
            document_name: doc.documentName,
            type: 'document'
          }
        }]
      });

      return pointId;
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  async deleteContract(contractId) {
    await this.initialize();

    try {
      const pointId = this.generatePointId(contractId);
      await this.client.delete(this.collectionName, {
        points: [pointId]
      });
      console.log(`Deleted contract from vector DB: ${contractId}`);
    } catch (error) {
      console.error('Error deleting from vector DB:', error);
    }
  }

  prepareContractText(contract) {
    // Combine relevant fields for embedding
    const parts = [
      contract.title,
      contract.description,
      contract.naicsCode ? `NAICS: ${contract.naicsCode}` : '',
      contract.setAside || '',
      contract.department || '',
      contract.placeOfPerformance?.state || ''
    ];

    return parts.filter(Boolean).join(' ');
  }

  async getEmbedding(text) {
    // This is a placeholder - in production, use a real embedding service
    // Options: OpenAI embeddings, Sentence Transformers, etc.
    
    // For now, return a random vector for testing
    return Array(384).fill(0).map(() => Math.random());
  }

  generatePointId(input) {
    // Generate a numeric ID from string
    const hash = crypto.createHash('md5').update(input).digest('hex');
    // Convert first 8 chars of hex to a number
    return parseInt(hash.substring(0, 8), 16);
  }
}

module.exports = new VectorDbService();
