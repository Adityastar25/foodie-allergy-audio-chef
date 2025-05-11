
class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isVoicesLoaded = false;

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
    }
  }

  public speak(text: string): void {
    // Stop any current speech
    this.stop();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
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
    
    // Start speaking
    this.synthesis.speak(utterance);
  }

  public stop(): void {
    this.synthesis.cancel();
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
    return this.synthesis.speaking;
  }
}

export default SpeechService.getInstance();
