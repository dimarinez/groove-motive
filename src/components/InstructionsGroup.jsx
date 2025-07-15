export default function InstructionsGroup() {
  return (
    <div id="instructions-group" className="instructions-group">
      <div className="instruction-container instruction-container--keyboard">
        <img src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Instructions-Keyboard.svg" alt="Instruction Keyboard" className="keyboard"/>
        <p>Press these keys on your<br/>keyboard to move around</p>
      </div>
      <div className="instruction-container instruction-container--mouse">
        <img src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Instructions-Mouse.svg" alt="Instruction Mouse" className="mouse"/>
        <p>Move your mouse<br/>to look around</p>
      </div>
      <div className="instruction-container instruction-container--gyro">
        <img src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Instructions-Gyro.svg" alt="Instruction Gyro" className="gyro"/>
        <p>Move your device<br/>to look around</p>
        <div id="orientation-status" className="orientation-status">
          <span id="orientation-indicator" className="orientation-indicator">⚠️</span>
          <span id="orientation-text">Orientation: Not requested</span>
        </div>
        <div id="orientation-values" className="orientation-values" style={{ display: 'none' }}>
          <div>α: <span id="alpha-value">0</span>°</div>
          <div>β: <span id="beta-value">0</span>°</div>
          <div>γ: <span id="gamma-value">0</span>°</div>
        </div>
      </div>
      <div className="instruction-container instruction-container--escape">
        <div className="escape-key">ESC</div>
        <p>Press to exit<br/>the gallery</p>
      </div>
    </div>
  );
}