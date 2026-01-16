import { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { RotateCcw } from 'lucide-react';
import './App.css';

// Predefined messages
const MESSAGES = [
  "Tu sonrisa", "Tu ojitos lindos", "Tu risa contagiosa", "Tu inteligencia", "Tu bondad",
  "Tu apoyo incondicional", "Cómo me cuidas", "Tu determinación",
  "Tu creatividad", "Tu forma de ver la vida", "Tu valentía", "Tu sinceridad", "Tu ternura",
  "Tu pasión por lo que haces", "Tu estilo único", "Tu voz", "Tus abrazos", "Tus besos",
  "Cómo me escuchas", "Tu empatía", "Tu generosidad", "Tu fuerza", "Tu humildad",
  "Tu optimismo", "Tu elegancia", "Tu aroma", "Tu suavidad", "Tu compañía",
  "Nuestras conversaciones", "Tu curiosidad", "Tu madurez", "Tu alegría",
  "Cómo iluminas cada lugar", "Tu confianza en mí", "Tu lealtad", "Tu lado divertido", "Tu lado serio",
  "Tu ambición", "Tu resiliencia", "Tu espíritu aventurero", "Tu calma", "Tu energía",
  "Cómo me haces sentir especial", "Tu intuición", "Tu sabiduría", "Tu honestidad", "Tu carisma",
  "Tu dedicación", "Tu disciplina", "Tu amor por los niños", "Tu educación",
  "Tu puntualidad", "Tu organización", "Tu espontaneidad", "Tu claridad",
  "Tu forma de vestir", "Tu cabello", "Tus manos", "Tu piel", "Tu perfil",
  "Tu forma de caminar", "Tu seguridad", "Tu vulnerabilidad", "Tu autenticidad", "Tu brillo propio",
  "Tu capacidad de perdonar", "Tu comprensión", "Tu paz", "Tu dulzura",
  "Tu firmeza", "Tu delicadeza", "Tu ingenio", "Tu memoria", "Tu atención al detalle",
  "Tu forma de soñar", "Tu fe en nosotros", "Tu compromiso", "Tu integridad",
  "Tu independencia", "Tu calidez", "Tu luz", "Tu magia", "Tu esencia",
  "Tu complicidad", "Tu amistad", "Tu amor", "Tu presencia", "Tu futuro conmigo",
  "Tu pasado que te hizo quien eres", "Tu presente a mi lado", "Todo lo que aprendo de ti", "Simplemente tú", "Que seas mi novia"
];

const IMAGES = [
  '/resources/r1.png',
  '/resources/r2.png',
  '/resources/r3.png',
  '/resources/r4.png',
  '/resources/r5.png',
  '/resources/r6.png',
];

// Configuration for text background boxes
const BOX_CONFIG = [
  { file: '/cajas/caja 1.png', padding: '0px 0px 0px 0px' },
  { file: '/cajas/caja 2.png', padding: '10px' },
  { file: '/cajas/caja 3.png', padding: '10px' },
  { file: '/cajas/caja 4.png', padding: '0px 10px 0px 0px' }, // Right 10px. Top, right, bottom, left
  { file: '/cajas/caja 5.png', padding: '0px 10px 5px 0px' },  // Right 10px, Bottom 5px
  { file: '/cajas/caja 6.png', padding: '10px 0px 0px 0px' },  // Top 10px
];

export default function App() {
  const engineRef = useRef(null);
  const [bodies, setBodies] = useState([]);

  // Initialize Matter.js (Run once)
  useEffect(() => {
    const engine = Matter.Engine.create({
      positionIterations: 10,
      velocityIterations: 10,
    });
    engineRef.current = engine;

    const runner = Matter.Runner.create();

    // Floor
    const floorThickness = 2000;
    const floorY = window.innerHeight + (floorThickness / 2);
    const floor = Matter.Bodies.rectangle(
      window.innerWidth / 2, floorY, window.innerWidth, floorThickness,
      { isStatic: true, label: "Floor" }
    );

    // Walls
    const wallThickness = 200;
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight * 4,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight * 4,
      { isStatic: true }
    );

    Matter.World.add(engine.world, [floor, leftWall, rightWall]);
    Matter.Runner.run(runner, engine);

    // Sync Loop
    let animationFrameId;
    const updateLoop = () => {
      if (!engineRef.current) return;
      const allBodies = Matter.Composite.allBodies(engine.world);
      const dynamicBodies = allBodies.filter(b => !b.isStatic);

      setBodies(dynamicBodies.map(body => ({
        id: body.id,
        position: body.position,
        angle: body.angle,
        render: body.render // Contains all visual info (text, image url, type, etc)
      })));

      animationFrameId = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    return () => {
      Matter.Runner.stop(runner);
      cancelAnimationFrame(animationFrameId);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
    };
  }, []);

  const addItem = () => {
    if (!engineRef.current) return;

    const isImage = Math.random() > 0.4; // threshold from user
    let body;

    const x = Math.random() * (window.innerWidth - 200) + 100;
    const y = -150;
    const angle = (Math.random() - 0.5) * 0.5;

    if (isImage) {
      // Logic for Image Body
      const imgUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];
      // Random size between 80px and 160px
      const size = 80 + Math.random() * 80;

      body = Matter.Bodies.rectangle(x, y, size, size, {
        restitution: 0.3,
        friction: 0.6,
        angle: angle,
        chamfer: { radius: 20 },
        render: {
          type: 'image',
          url: imgUrl,
          width: size,
          height: size
        }
      });
    } else {
      // Logic for Text Body
      const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      // Pick random box config
      const box = BOX_CONFIG[Math.floor(Math.random() * BOX_CONFIG.length)];

      const width = Math.max(140, text.length * 15 + 60);
      const height = 70;

      body = Matter.Bodies.rectangle(x, y, width, height, {
        restitution: 0.4,
        friction: 0.5,
        angle: angle,
        chamfer: { radius: 15 }, // Less rounded physics to fit box images better
        render: {
          type: 'text',
          text: text,
          boxUrl: box.file,
          padding: box.padding,
          width: width,
          height: height
        }
      });
    }

    Matter.World.add(engineRef.current.world, body);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Header / Button Container */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <p style={{ fontWeight: 'bold', color: '#aaa' }}>
            Hola sami, te amo, amo mil cosas de ti, queria expresartelo un poco distinto.
          </p>
          <img
            src="/boton.png"
            alt="Lanzar"
            onClick={addItem}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
              maxWidth: '150px',
              height: 'auto'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
          <p style={{ fontWeight: 'bold', marginTop: '1rem', color: '#aaa' }}>
            Toca el osito para saberlo...
          </p>

          <button
            onClick={() => {
              if (engineRef.current) {
                Matter.Composite.clear(engineRef.current.world, true);
                setBodies([]);
              }
            }}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              fontWeight: 'bold',
              background: 'rgba(255, 255, 255, 0.42)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '15px auto 0',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              zIndex: 200,
              pointerEvents: 'auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Physics Bodies Render Layer */}
      {bodies.map(body => (
        <PhysicsItem key={body.id} {...body} />
      ))}

      {/* Floor Visual */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '20px',
        background: 'rgba(255,255,255,0.1)',
        pointerEvents: 'none',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }} />
    </div>
  );
}

function PhysicsItem({ position, angle, render }) {
  const { x, y } = position;
  const { width, height, type } = render;

  const baseStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate(${x}px, ${y}px) rotate(${angle}rad) translate(-50%, -50%)`,
    width: `${width}px`,
    height: `${height}px`,
    willChange: 'transform',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: 50,
  };

  if (type === 'image') {
    return (
      <img
        src={render.url}
        alt="item"
        style={{
          ...baseStyle,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
        }}
      />
    );
  }

  // Text Fallback (Now using Box Images)
  return (
    <div
      style={{
        ...baseStyle,
        backgroundImage: `url('${render.boxUrl}')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        // Use predefined padding if available
        padding: render.padding || '0px',
        // Don't clip shadow if possible, but contained background needs explicit handling.
        // We render background on the div itself.
        filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.3))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: '1.2rem',
        fontFamily: '"Barriecito", system-ui, cursive',
        whiteSpace: 'nowrap',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}
    >
      {render.text}
    </div>
  );
}
