# GRAFFX

Virtual AR graffiti app. Tag the world.

**[Launch App](https://systemprogramdev.github.io/grafAR/)**

## Features

- Spray paint on real-world surfaces via AR
- 10 color palette
- Adjustable spray width
- Synthesized spray sound
- Save/clear your work

## Requirements

- **Android** + Chrome + ARCore
- HTTPS required

> iOS Safari does not support WebXR AR. Android only.

## Tech

- WebXR (immersive-ar, hit-test)
- React + Three.js + @react-three/xr
- Vite
- Web Audio API

## Dev

```bash
npm install
npm run dev -- --host
```

Access via phone on same network (accept self-signed cert warning).

## License

MIT
