
# VIRTUAL GRAFFITI AR — AGENT-READY TECH SPEC

## 0. Scope

* Mobile AR application
* Persistent virtual graffiti anchored to real-world walls
* Multi-user visibility
* Non-AI rendering and anchoring
* Deterministic geometry + sensor fusion

---

## 1. Target Platforms

* iOS (ARKit required)
* Android (ARCore required)

**Out of scope**

* Web authoring
* AI image generation
* Face tracking

---

## 2. Core Functional Requirements

### User Capabilities

* View environment through camera
* Detect vertical wall surfaces
* Paint graffiti onto walls using touch
* Hear real-time spray audio feedback
* Persist graffiti at physical location
* Rediscover graffiti reliably later
* View graffiti created by other users

---

## 3. System Architecture

```
Camera Feed
→ Visual-Inertial SLAM
→ Vertical Plane Detection
→ Raycast → Wall UV Mapping
→ Offscreen Texture Painting
→ AR World Anchor Creation
→ Geo + Visual Fingerprint Capture
→ Backend Storage
→ Relocalization Pipeline
```

---

## 4. AR Tracking & Mapping

### Tracking Method

* Visual-Inertial Odometry
* Feature point extraction
* Continuous pose estimation

### Plane Detection

* Vertical planes only
* Store:

  * Plane normal
  * Plane extents
  * Plane confidence score

### Constraints

* Reject planes below confidence threshold
* Reject planes < minimum area

---

## 5. Graffiti Rendering Engine

### Input

* Touch position
* Touch velocity
* Touch duration
* Camera distance to plane

### Projection

* Screen → Raycast → Plane hit
* Convert hit to plane-local UV
* Paint into offscreen texture

### Spray Physics (Deterministic)

* Velocity → brush radius
* Distance → opacity falloff
* Randomized splatter offset
* Layered alpha blending
* Optional gravity-based drip pass

### Output

* RGBA texture mapped to wall plane

---

## 6. Audio System

### Spray Sound

* Looping spray sample
* Modulate:

  * Volume ← stroke speed
  * Pitch ← distance
* Spatialized stereo

### Environment

* Optional light reverb
* Room size approximated from mesh density

---

## 7. Persistence Model (CRITICAL)

### Anchoring Layers (All Required)

#### A. AR World Anchor

* Local transform (position, rotation, scale)
* Session-persistent anchor ID

#### B. Geolocation Anchor

* Latitude
* Longitude
* Altitude (if available)
* Compass heading at creation

#### C. Visual Fingerprint

Store at creation:

* Grayscale wall snapshot
* Feature descriptors (ORB-class)
* Edge map
* Texture histogram
* Optional depth snapshot (LiDAR)

#### D. Spatial Context

* Plane orientation
* Plane dimensions
* Nearby feature cloud summary
* Lighting estimate
* Timestamp

---

## 8. Re-Localization Pipeline

```
GPS Radius Filter
→ Visual Feature Matching
→ Confidence Scoring
→ Plane Re-detection
→ Transform Delta Correction
→ Anchor Reattachment
```

### Rules

* If confidence < threshold → do not render
* If plane mismatch → hide graffiti
* No speculative rendering

---

## 9. Backend Data Model

### GraffitiTag

```
tag_id
user_id (nullable / anonymous)
created_at
geo_lat
geo_lng
geo_alt
world_anchor_transform
plane_normal
plane_extents
visual_fingerprint_bundle
depth_summary (optional)
brush_stroke_data
texture_reference
trust_score
visibility_state
```

---

## 10. Trust & Anti-Drift System

### Trust Score Inputs

* Successful rediscovery count
* Independent user confirmations
* Visual match consistency
* Time stability

### Behavior

* Low trust → hidden by default
* High trust → auto-render

### Anti-Abuse

* Rate limit per location
* Require plane confidence
* Sensor coherence validation
* Optional stationary confirmation delay

---

## 11. Multiplayer / Discovery

* Proximity-based tag loading
* Radius-bounded queries
* Optional upvote / confirm visibility
* Optional layered graffiti (permission-gated)

---

## 12. Performance Constraints

* Texture size caps
* Stroke batching
* LOD scaling by distance
* Occlusion via depth mesh
* Memory pressure monitoring

---

## 13. Privacy & Safety Constraints

* No face capture
* No raw camera feed storage
* No continuous location tracking
* Opt-in publishing only
* Local-only drafts until publish

---

## 14. Known Failure Modes

* Featureless walls (plain white)
* Extreme lighting changes
* GPS drift in dense urban areas

### Mitigations

* Visual fingerprint weighting
* Multi-user confirmation
* Confidence-gated rendering

---

## 15. Non-Goals (Explicit)

* AI style generation
* Semantic wall understanding
* Automatic graffiti suggestions
* Facial or person tracking

---

## 16. Feasibility Status

* Technically feasible with current hardware
* Requires native AR frameworks
* WebAR insufficient for persistence guarantees

---

