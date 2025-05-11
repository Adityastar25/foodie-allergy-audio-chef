
class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isVoicesLoaded = false;
  private utteranceQueue: string[] = []; // Queue for managing long text
  private isProcessingQueue = false;

  private constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Load voices
    this.loadVoices();
    
    // Some browsers require this event to get voices
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private loadVoices(): void {
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      this.voices = voices;
      this.isVoicesLoaded = true;
      console.log("Voices loaded:", this.voices.length);
    }
  }

  // Split long text into smaller chunks to avoid speech cutoff
  private splitTextIntoChunks(text: string): string[] {
    // Split by sentences
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== "");
    
    const chunks: string[] = [];
    let currentChunk = "";
    
    // Group sentences into chunks of reasonable length
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim() + ". ";
      
      // If adding this sentence would make the chunk too long, start a new chunk
      if ((currentChunk + trimmedSentence).length > 200) {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = trimmedSentence;
      } else {
        currentChunk += trimmedSentence;
      }
    }
    
    // Add the last chunk if there is one
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  public speak(text: string): void {
    // Stop any current speech
    this.stop();
    
    // Clear any existing queue
    this.utteranceQueue = [];
    this.isProcessingQueue = false;
    
    // Split long text into manageable chunks
    this.utteranceQueue = this.splitTextIntoChunks(text);
    
    // Start processing the queue
    this.processQueue();
  }
  
  private processQueue(): void {
    if (this.isProcessingQueue || this.utteranceQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    const nextText = this.utteranceQueue.shift();
    
    if (!nextText) {
      this.isProcessingQueue = false;
      return;
    }
    
    // Create a new utterance for this chunk
    const utterance = new SpeechSynthesisUtterance(nextText);
    
    // Set preferred voice (English female voice if available)
    if (this.isVoicesLoaded) {
      const englishVoice = this.voices.find(
        voice => voice.lang.includes('en') && voice.name.includes('Female')
      );
      utterance.voice = englishVoice || null;
    }
    
    // Configure speech properties
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Store current utterance so we can cancel it later if needed
    this.currentUtterance = utterance;
    
    // When this chunk finishes, process the next one
    utterance.onend = () => {
      this.currentUtterance = null;
      this.isProcessingQueue = false;
      
      // Process next chunk if available
      if (this.utteranceQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100); // Small delay between chunks
      }
    };
    
    // Handle errors
    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      this.isProcessingQueue = false;
      this.currentUtterance = null;
      
      // Attempt to continue with next chunk
      setTimeout(() => this.processQueue(), 100);
    };
    
    // Start speaking
    this.synthesis.speak(utterance);
  }

  public stop(): void {
    this.synthesis.cancel();
    this.utteranceQueue = [];
    this.isProcessingQueue = false;
    this.currentUtterance = null;
  }

  public isPaused(): boolean {
    return this.synthesis.paused;
  }

  public pause(): void {
    this.synthesis.pause();
  }

  public resume(): void {
    this.synthesis.resume();
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking || this.utteranceQueue.length > 0;
  }
}

export default SpeechService.getInstance();

