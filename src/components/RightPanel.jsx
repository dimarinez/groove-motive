export default function RightPanel() {
  return (
    <div id="right-panel">
      <canvas id="gallery-canvas"></canvas>
      <button id="enter-button">Click to enter the listening room</button>
      <div id="instructions-group" className="instructions-group">
        <div className="instruction-container instruction-container--keyboard">
          <img src="/src/assets/Instructions-Keyboard.svg" alt="Instruction Keyboard" className="keyboard"/>
          <p>Press these keys on your<br/>keyboard to move around</p>
        </div>
        <div className="instruction-container instruction-container--mouse">
          <img src="/src/assets/Instructions-Mouse.svg" alt="Instruction Mouse" className="mouse"/>
          <p>Move your mouse<br/>to look around</p>
        </div>
        <div className="instruction-container instruction-container--gyro">
          <img src="/src/assets/Instructions-Gyro.svg" alt="Instruction Gyro" className="gyro"/>
          <p>Rotate your device<br/>to look around</p>
        </div>
      </div>
    </div>
  );
}