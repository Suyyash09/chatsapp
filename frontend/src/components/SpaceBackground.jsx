import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── stars ──────────────────────────────────────────────
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.15,
      alpha: 0,
      speed: Math.random() * 0.018 + 0.004,
      phase: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.85
          ? "180,210,255"
          : Math.random() > 0.5
            ? "255,255,255"
            : "210,190,255",
    }));

    // ── shooting stars ─────────────────────────────────────
    const shoots = [];
    function spawnShoot() {
      shoots.push({
        x: Math.random() * 0.5 + 0.05,
        y: Math.random() * 0.35,
        len: Math.random() * 80 + 50,
        speed: Math.random() * 4 + 3,
        alpha: 1,
        angle: Math.PI / 5,
      });
    }
    const shootInterval = setInterval(spawnShoot, 3200);

    // ── supernova position ─────────────────────────────────
    let novaPos = {
      cx: canvas.width * 0.78,
      cy: canvas.height * 0.28,
    };

    function randomNovaPos() {
      return {
        cx: canvas.width * (0.2 + Math.random() * 0.6),
        cy: canvas.height * (0.15 + Math.random() * 0.55),
      };
    }

    function getSNPos() {
      return novaPos;
    }

    // ── supernova ejecta ───────────────────────────────────
    const ejecta = [];
    function initEjecta() {
      const { cx, cy } = novaPos;
      ejecta.length = 0;
      const colors = [
        [255, 100, 30],
        [255, 180, 50],
        [255, 230, 120],
        [200, 80, 255],
        [100, 180, 255],
        [255, 60, 120],
        [255, 255, 200],
      ];
      for (let i = 0; i < 160; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.3;
        const c = colors[Math.floor(Math.random() * colors.length)];
        ejecta.push({
          cx,
          cy,
          x: cx + (Math.random() - 0.5) * 8,
          y: cy + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 2.2 + 0.5,
          alpha: Math.random() * 0.7 + 0.3,
          fade: Math.random() * 0.003 + 0.001,
          color: c,
          trail: [],
          maxTrail: Math.floor(Math.random() * 8 + 4),
        });
      }
    }

    // ── shockwave rings ────────────────────────────────────
    const rings = [];
    function initRings() {
      const { cx, cy } = novaPos;
      rings.length = 0;
      for (let i = 0; i < 3; i++) {
        rings.push({
          cx,
          cy,
          r: 0,
          maxR: Math.max(canvas.width, canvas.height) * 0.65,
          speed: 1.2 + i * 0.5,
          alpha: 0.5,
          delay: i * 40,
        });
      }
    }

    // ── nova state ─────────────────────────────────────────
    let t = 0,
      novaT = 0;
    const FLASH_START = 60,
      EXPAND_START = 80;
    let initialized = false;

    function resetNova() {
      novaT = 0;
      novaPos = randomNovaPos();
      initEjecta();
      initRings();
    }

    function drawSupernova() {
      const W = canvas.width;
      const { cx, cy } = getSNPos();

      if (!initialized) {
        initEjecta();
        initRings();
        initialized = true;
      }
      novaT++;

      const novaPhase = novaT < FLASH_START ? 0 : novaT < EXPAND_START ? 1 : 2;

      // phase 0 — pulsing progenitor star
      if (novaPhase === 0) {
        const pulse = 0.7 + 0.3 * Math.sin(novaT * 0.18);
        const coreR = 10 * pulse;
        const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 5);
        g1.addColorStop(0, `rgba(255,240,200,${0.8 * pulse})`);
        g1.addColorStop(0.3, `rgba(255,160,60,${0.4 * pulse})`);
        g1.addColorStop(1, "rgba(255,80,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 5, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        const sg = ctx.createRadialGradient(
          cx - coreR * 0.3,
          cy - coreR * 0.3,
          0,
          cx,
          cy,
          coreR,
        );
        sg.addColorStop(0, "#ffffff");
        sg.addColorStop(0.4, "#ffe080");
        sg.addColorStop(1, "#ff6600");
        ctx.fillStyle = sg;
        ctx.fill();
      }

      // phase 1 — white hot flash
      if (novaPhase === 1) {
        const progress = (novaT - FLASH_START) / (EXPAND_START - FLASH_START);
        const flashR = progress * W * 0.5;
        const flashAlpha = (1 - progress) * 0.85;
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        fg.addColorStop(0, `rgba(255,255,255,${flashAlpha})`);
        fg.addColorStop(0.2, `rgba(255,230,150,${flashAlpha * 0.8})`);
        fg.addColorStop(0.5, `rgba(255,120,30,${flashAlpha * 0.4})`);
        fg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
        ctx.fillStyle = fg;
        ctx.fill();
      }

      // phase 2 — expanding nebula + ejecta + rings
      if (novaPhase === 2) {
        const age = novaT - EXPAND_START;

        // after ~5 seconds reset to new random position
        if (age > 300) {
          resetNova();
          return;
        }

        // fade out before reset
        const fadeOut = age > 250 ? 1 - (age - 250) / 50 : 1;

        ctx.save();
        ctx.globalAlpha = fadeOut;

        // nebula cloud layers
        const nebulaColors = [
          [255, 60, 120, 0.06],
          [180, 60, 255, 0.07],
          [255, 140, 30, 0.05],
          [60, 160, 255, 0.06],
        ];
        for (let i = 0; i < nebulaColors.length; i++) {
          const [r, g, b, a] = nebulaColors[i];
          const nr = Math.min(age * 1.1 + i * 30, W * 0.55);
          const ox = Math.cos(i * 1.2) * nr * 0.15;
          const oy = Math.sin(i * 1.4) * nr * 0.12;
          const ng = ctx.createRadialGradient(
            cx + ox,
            cy + oy,
            nr * 0.1,
            cx + ox,
            cy + oy,
            nr,
          );
          ng.addColorStop(0, `rgba(${r},${g},${b},${Math.min(a * 1.5, 0.18)})`);
          ng.addColorStop(0.5, `rgba(${r},${g},${b},${a})`);
          ng.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(cx + ox, cy + oy, nr, 0, Math.PI * 2);
          ctx.fillStyle = ng;
          ctx.fill();
        }

        // shockwave rings
        for (const ring of rings) {
          if (age < ring.delay) continue;
          ring.r += ring.speed;
          ring.alpha = Math.max(0, 0.45 * (1 - ring.r / ring.maxR));
          if (ring.r < ring.maxR) {
            ctx.beginPath();
            ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,200,100,${ring.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(ring.cx, ring.cy, ring.r * 0.95, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,${ring.alpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // remnant core
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
        coreGlow.addColorStop(0, "rgba(200,230,255,0.9)");
        coreGlow.addColorStop(0.3, "rgba(150,200,255,0.5)");
        coreGlow.addColorStop(1, "rgba(100,150,255,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240,250,255,0.95)";
        ctx.fill();

        // ejecta particles
        for (const p of ejecta) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > p.maxTrail) p.trail.shift();
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.998;
          p.vy *= 0.998;
          p.alpha -= p.fade;
          if (p.alpha <= 0) {
            const a = Math.random() * Math.PI * 2;
            const sp = Math.random() * 1.6 + 0.3;
            p.x = cx + (Math.random() - 0.5) * 6;
            p.y = cy + (Math.random() - 0.5) * 6;
            p.vx = Math.cos(a) * sp;
            p.vy = Math.sin(a) * sp;
            p.alpha = Math.random() * 0.6 + 0.3;
          }
          for (let ti = 0; ti < p.trail.length - 1; ti++) {
            const ta = (ti / p.trail.length) * p.alpha * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.trail[ti].x, p.trail[ti].y);
            ctx.lineTo(p.trail[ti + 1].x, p.trail[ti + 1].y);
            ctx.strokeStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${ta})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
          const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
          pg.addColorStop(
            0,
            `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`,
          );
          pg.addColorStop(
            1,
            `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`,
          );
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.8})`;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    let raf;
    function draw() {
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // bg nebula
      const nb = ctx.createRadialGradient(
        W * 0.2,
        H * 0.75,
        0,
        W * 0.2,
        H * 0.75,
        W * 0.45,
      );
      nb.addColorStop(0, "rgba(20,0,40,0.2)");
      nb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nb;
      ctx.fillRect(0, 0, W, H);

      drawSupernova();

      // stars
      const { cx, cy } = getSNPos();
      for (const s of stars) {
        const dx = s.x * W - cx,
          dy = s.y * H - cy;
        if (Math.sqrt(dx * dx + dy * dy) < 60 && novaT >= FLASH_START) continue;
        s.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        if (s.r > 1.1) {
          const g = ctx.createRadialGradient(
            s.x * W,
            s.y * H,
            0,
            s.x * W,
            s.y * H,
            s.r * 4,
          );
          g.addColorStop(0, `rgba(${s.color},${s.alpha})`);
          g.addColorStop(1, `rgba(${s.color},0)`);
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${s.alpha})`;
        ctx.fill();
        if (s.r > 1.1 && s.alpha > 0.65) {
          const len = s.r * 5 * (s.alpha - 0.4);
          ctx.save();
          ctx.globalAlpha = (s.alpha - 0.4) * 0.7;
          ctx.strokeStyle = `rgba(${s.color},1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x * W - len, s.y * H);
          ctx.lineTo(s.x * W + len, s.y * H);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s.x * W, s.y * H - len);
          ctx.lineTo(s.x * W, s.y * H + len);
          ctx.stroke();
          ctx.restore();
        }
      }

      // shooting stars
      for (let i = shoots.length - 1; i >= 0; i--) {
        const sh = shoots[i];
        const ex = sh.x * W + Math.cos(sh.angle) * sh.len;
        const ey = sh.y * H + Math.sin(sh.angle) * sh.len;
        const gr = ctx.createLinearGradient(sh.x * W, sh.y * H, ex, ey);
        gr.addColorStop(0, "rgba(255,255,255,0)");
        gr.addColorStop(1, `rgba(255,255,255,${sh.alpha * 0.75})`);
        ctx.beginPath();
        ctx.moveTo(sh.x * W, sh.y * H);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = gr;
        ctx.lineWidth = 1;
        ctx.stroke();
        sh.x += (Math.cos(sh.angle) * sh.speed) / W;
        sh.y += (Math.sin(sh.angle) * sh.speed) / H;
        sh.alpha -= 0.011;
        if (sh.alpha <= 0) shoots.splice(i, 1);
      }

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(shootInterval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
