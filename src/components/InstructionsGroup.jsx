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
      </div>
      <div className="instruction-container instruction-container--escape">
        <div className="escape-key">ESC</div>
        <p>Press to exit<br/>the gallery</p>
      </div>
    </div>
  );
}