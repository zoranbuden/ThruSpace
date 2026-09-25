/* ThruSpace v0.2 — one space: square, circle, and the axes they share.
   Add a third coordinate and the square becomes a cube, the circle a sphere.

   x, y, z : -100..100, share of half the container, origin at centre, y up
   angle   : degrees from the positive x-axis
   phi     : degrees from the axis facing the viewer; 90 is the screen plane
   radius  : 0..100, share of the inscribed circle or sphere
   any value may be a range: [min, max]
   space   : a list of items placed inside this element, in its own units
*/
(function (global) {
  'use strict';
  var RAD = Math.PI / 180;

  function isInterval(v){ return Array.isArray(v) && v.length === 2; }
  function has(s, k){ return s[k] !== undefined && s[k] !== null; }

  function detectFrame(spec){
    var polar = has(spec,'angle') || has(spec,'radius') || has(spec,'phi');
    var cart  = has(spec,'x') || has(spec,'y') || has(spec,'z');
    if (polar && cart) return 'mixed';
    if (polar) return 'circle';   /* with phi, the circle becomes a sphere */
    return 'square';              /* with z, the square becomes a cube    */
  }

  function sample(v, t){
    if (isInterval(v)) return v[0] + (v[1] - v[0]) * t;
    return v || 0;
  }

  function evaluate(spec, frame, t){
    if (frame === 'circle' || frame === 'mixed'){
      /* phi is measured from the axis pointing at the viewer, so phi = 90
         is the screen plane and a call written without phi is unchanged */
      var th  = sample(spec.angle, t) * RAD;
      var phi = (has(spec,'phi') ? sample(spec.phi, t) : 90) * RAD;
      var r   = has(spec,'radius') ? sample(spec.radius, t) : 100;
      var sp  = Math.sin(phi);
      var px = r * sp * Math.cos(th),
          py = r * sp * Math.sin(th),
          pz = r * Math.cos(phi);
      if (frame === 'mixed'){
        if (has(spec,'x')) px = sample(spec.x, t);
        if (has(spec,'y')) py = sample(spec.y, t);
        if (has(spec,'z')) pz = sample(spec.z, t);
      }
      return { x: px, y: py, z: pz };
    }
    return {
      x: sample(spec.x, t),
      y: sample(spec.y, t),
      z: has(spec,'z') ? sample(spec.z, t) : 0
    };
  }

  function overlaps(a, b){
    return Math.abs(a.x - b.x) < (a.hw + b.hw) &&
           Math.abs(a.y - b.y) < (a.hh + b.hh) &&
           Math.abs(a.z - b.z) < (a.hd + b.hd);
  }

  var SAMPLES = [0.5,0.35,0.65,0.2,0.8,0.1,0.9,0,1,0.45,0.55,0.28,0.72,0.15,0.85];

  function layout(container, items){
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) throw new Error('ThruSpace: container not found.');
    if (!Array.isArray(items)) items = [];

    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';

    var halfW = container.clientWidth / 2, halfH = container.clientHeight / 2;
    if (!halfW || !halfH) return { placed: [], notes: [], items: items, depth: 0 };
    var ringR = Math.min(halfW, halfH);

    var placed = [], notes = [];

    /* space units differ per axis and per frame, so collisions are settled in pixels */
    function toPixels(pos, frame, spec){
      if (frame === 'circle') return {
        x: pos.x / 100 * ringR, y: pos.y / 100 * ringR, z: pos.z / 100 * ringR
      };
      if (frame === 'mixed') return {
        x: has(spec,'x') ? pos.x / 100 * halfW : pos.x / 100 * ringR,
        y: has(spec,'y') ? pos.y / 100 * halfH : pos.y / 100 * ringR,
        z: pos.z / 100 * ringR
      };
      return { x: pos.x / 100 * halfW, y: pos.y / 100 * halfH, z: pos.z / 100 * ringR };
    }

    items.forEach(function (spec){
      var el = typeof spec.el === 'string' ? document.querySelector(spec.el) : spec.el;
      if (!el) return;

      el.style.position = 'absolute';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.margin = '0';

      /* offsetWidth is the laid-out size; getBoundingClientRect would return the
         size after projection, which changes as soon as the space is rotated */
      var hw = (el.offsetWidth || 0) / 2, hh = (el.offsetHeight || 0) / 2;

      var frame = detectFrame(spec);
      var flexible = ['x','y','angle','radius'].some(function(k){ return isInterval(spec[k]); });
      var pos = null, usedT = 0.5, clash = false;

      function candidate(t){
        var unit = evaluate(spec, frame, t);
        var px = toPixels(unit, frame, spec);
        return { x: px.x, y: px.y, z: px.z, hw: hw, hh: hh, hd: Math.min(hw, hh), unit: unit };
      }

      if (!flexible){
        pos = candidate(0.5);
        clash = placed.some(function(p){ return overlaps(p, pos); });
        if (clash) notes.push({ el: el, text: 'fixed position overlaps and has no range to move within' });
      } else {
        for (var i = 0; i < SAMPLES.length; i++){
          var cand = candidate(SAMPLES[i]);
          pos = cand; usedT = SAMPLES[i];
          if (!placed.some(function(p){ return overlaps(p, cand); })){ clash = false; break; }
          clash = true;
        }
        if (clash) notes.push({ el: el, text: 'no free position inside the range, nearest taken' });
        else if (usedT !== 0.5) notes.push({ el: el, text: 'moved to t=' + usedT.toFixed(2) + ' inside its range to clear an overlap' });
      }

      placed.push(pos);

      el.style.transform = (Math.abs(pos.z) < 0.01)
        ? 'translate(calc(-50% + ' + pos.x.toFixed(2) + 'px), calc(-50% - ' + pos.y.toFixed(2) + 'px))'
        : 'translate3d(' + pos.x.toFixed(2) + 'px, ' + (-pos.y).toFixed(2) + 'px, ' +
          pos.z.toFixed(2) + 'px) translate(-50%, -50%)';

      spec._frame = frame;
      spec._resolved = { x: pos.unit.x, y: pos.unit.y, z: pos.unit.z, t: usedT };

      /* an element is itself a space: its children are placed against its own
         square, circle and axes, in its own units, with its own conflicts */
      if (Array.isArray(spec.space) && spec.space.length){
        var inner = layout(el, spec.space);
        inner.notes.forEach(function (nt){ notes.push(nt); });
        spec._depth = 1 + inner.depth;
      } else {
        spec._depth = 0;
      }
    });

    var depth = items.reduce(function (d, it){
      return Math.max(d, it._depth || 0);
    }, 0);

    return { placed: placed, notes: notes, items: items, depth: depth };
  }

  function ring(selector, opts){
    opts = opts || {};
    var els = typeof selector === 'string'
      ? Array.prototype.slice.call(document.querySelectorAll(selector))
      : selector;
    var start  = opts.start  !== undefined ? opts.start  : 0;
    var end    = opts.end    !== undefined ? opts.end    : 360;
    var radius = opts.radius !== undefined ? opts.radius : 80;
    var full = Math.abs(end - start) >= 360;
    var n = els.length;
    var step = n ? (end - start) / (full ? n : Math.max(n - 1, 1)) : 0;
    return els.map(function (el, i){
      return { el: el, angle: start + step * i, radius: radius };
    });
  }

  /* even spread over a sphere, the way ring() spreads over a circle */
  function ball(selector, opts){
    opts = opts || {};
    var els = typeof selector === 'string'
      ? Array.prototype.slice.call(document.querySelectorAll(selector))
      : selector;
    var radius = opts.radius !== undefined ? opts.radius : 80;
    var n = els.length;
    var golden = Math.PI * (3 - Math.sqrt(5));
    return els.map(function (el, i){
      var c = n > 1 ? 1 - (2 * i) / (n - 1) : 0;   /* cos(phi), from 1 down to -1 */
      var phi = Math.acos(Math.max(-1, Math.min(1, c))) / RAD;
      var theta = (golden * i) / RAD % 360;
      return { el: el, angle: theta, phi: phi, radius: radius };
    });
  }

  global.ThruSpace = { layout: layout, ring: ring, ball: ball, detectFrame: detectFrame };
})(window);
