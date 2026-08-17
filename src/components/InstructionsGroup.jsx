import keyboardInstruction from '../assets/Instructions-Keyboard.svg';
import mouseInstruction from '../assets/Instructions-Mouse.svg';
import gyroInstruction from '../assets/Instructions-Gyro.svg';

export default function InstructionsGroup() {
  return (
    <div id="instructions-group" className="instructions-group">
      <div className="instruction-container instruction-container--keyboard">
        <img src={keyboardInstruction} alt="" className="keyboard"/>
        <p><strong>Move</strong><span>Arrows / WASD</span></p>
      </div>
      <div className="instruction-container instruction-container--mouse">
        <img src={mouseInstruction} alt="" className="mouse"/>
        <p><strong>Look</strong><span>Move mouse</span></p>
      </div>
      <div className="instruction-container instruction-container--gyro">
        <img src={gyroInstruction} alt="" className="gyro"/>
        <p><strong>Look</strong><span>Tilt device</span></p>
      </div>
      <div className="instruction-container instruction-container--escape">
        <div className="escape-key">ESC</div>
        <p><strong>Exit</strong><span>Leave gallery</span></p>
      </div>
    </div>
  );
}
