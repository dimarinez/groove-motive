export default function RightPanel() {
  return (
    <div id="right-panel">
      <canvas id="gallery-canvas"></canvas>
      <div id="loading-indicator" className="loading-indicator" style={{ display: 'none' }}>
        <div className="loading-content">
          <div className="loading-icon">
            <div className="modern-loader">
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
            </div>
          </div>
          <h3>Loading gallery assets...</h3>
          <div className="progress-container">
            <div id="progress-bar" className="progress-bar"></div>
          </div>
          <div id="progress-text" className="progress-text">0%</div>
        </div>
      </div>
      <button id="enter-button">Click to enter the listening room</button>
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
    </div>
  );
}