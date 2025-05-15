class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isVoicesLoaded = false;
  private utteranceQueue: string[] = [];
  private isProcessingQueue = false;
  private fallbackMode = false;

  private constructor() {
    // Check if speech synthesis is available
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Some browsers require this event to get voices
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
      }
      
      // Force voice reload after a delay (some browsers need this)
      setTimeout(() => {
        if (this.voices.length === 0) {
          this.loadVoices();
        }
      }, 1000);
    } else {
      console.warn("Speech synthesis not supported in this browser");
      this.fallbackMode = true;
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private loadVoices(): void {
    if (!this.synthesis) return;
    
    const voices = this.synthesis.getVoices();
    if (voices && voices.length > 0) {
      this.voices = voices;
      this.isVoicesLoaded = true;
      console.log("Voices loaded:", this.voices.length);
    } else {
      console.warn("No voices available");
    }
  }

  // Split text into smaller chunks to avoid speech cutoff
  private splitTextIntoChunks(text: string): string[] {
    // Split by sentences
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== "");
    
    const chunks: string[] = [];
    let currentChunk = "";
    
    // Group sentences into chunks of reasonable length
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim() + ". ";
      
      // If adding this sentence would make the chunk too long, start a new chunk
      // Keep chunks even smaller (100 characters) to avoid synthesis errors
      if ((currentChunk + trimmedSentence).length > 100) {
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
    // Ensure speech synthesis is supported
    if (this.fallbackMode || !this.synthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }
    
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
    if (this.isProcessingQueue || this.utteranceQueue.length === 0 || !this.synthesis) return;
    
    this.isProcessingQueue = true;
    const nextText = this.utteranceQueue.shift();
    
    if (!nextText) {
      this.isProcessingQueue = false;
      return;
    }
    
    try {
      // Create a new utterance for this chunk
      const utterance = new SpeechSynthesisUtterance(nextText);
      
      // Set preferred voice (English voice if available)
      if (this.isVoicesLoaded && this.voices.length > 0) {
        // Try to find an English voice
        const englishVoice = this.voices.find(
          voice => voice.lang.includes('en')
        );
        
        // If found, use it; otherwise use the first available voice
        utterance.voice = englishVoice || this.voices[0];
        
        // Set language explicitly
        utterance.lang = utterance.voice.lang;
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
          setTimeout(() => this.processQueue(), 250); // Slightly longer delay between chunks
        }
      };
      
      // Handle errors
      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
        this.isProcessingQueue = false;
        this.currentUtterance = null;
        
        // Try different approach if there's an error
        try {
          // Chrome sometimes needs this approach
          if (this.synthesis) {
            this.synthesis.cancel();
            setTimeout(() => {
              if (this.synthesis && this.utteranceQueue.length > 0) {
                // Try to continue with the next chunk
                setTimeout(() => this.processQueue(), 500);
              }
            }, 500);
          }
        } catch (retryError) {
          console.error("Failed to recover from speech error:", retryError);
        }
      };
      
      // Start speaking - use try-catch as some browsers may throw errors
      try {
        this.synthesis.speak(utterance);
        
        // Chrome workaround - force resume if paused
        if (this.synthesis.paused) {
          this.synthesis.resume();
        }
      } catch (speakError) {
        console.error("Error during speak call:", speakError);
        this.isProcessingQueue = false;
      }
    } catch (error) {
      console.error("Error in speech synthesis setup:", error);
      this.isProcessingQueue = false;
      this.currentUtterance = null;
      
      // Try to process the next chunk
      if (this.utteranceQueue.length > 0) {
        setTimeout(() => this.processQueue(), 500);
      }
    }
  }

  public stop(): void {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (error) {
        console.error("Error stopping speech:", error);
      }
    }
    this.utteranceQueue = [];
    this.isProcessingQueue = false;
    this.currentUtterance = null;
  }

  public isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  public pause(): void {
    if (this.synthesis) {
      try {
        this.synthesis.pause();
      } catch (error) {
        console.error("Error pausing speech:", error);
      }
    }
  }

  public resume(): void {
    if (this.synthesis) {
      try {
        this.synthesis.resume();
      } catch (error) {
        console.error("Error resuming speech:", error);
      }
    }
  }

  public isSpeaking(): boolean {
    return (this.synthesis && this.synthesis.speaking) || this.utteranceQueue.length > 0;
  }
}

export default SpeechService.getInstance();
