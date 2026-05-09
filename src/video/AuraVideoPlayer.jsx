import { Player } from '@remotion/player';
import { PetVideo } from './PetVideo';

export const AuraVideoPlayer = ({ petName, autoPlay = false, showControls = true, onEnded }) => {
  return (
    <div style={{
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      width: '90%',
      maxWidth: '900px',
      margin: '40px auto',
      background: '#0F1115'
    }}>
      {/* paddingTop trick: garantiza aspect ratio 16/9 sin altura colapsada */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        <Player
          component={PetVideo}
          durationInFrames={150}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls={showControls}
          autoPlay={autoPlay}
          clickToPlay={!autoPlay}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          inputProps={{ petName: petName || "Mascota AURA" }}
          onEnded={onEnded}
        />
      </div>
    </div>
  );
};