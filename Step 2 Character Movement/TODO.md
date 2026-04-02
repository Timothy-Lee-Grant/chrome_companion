# Implementation Roadmap for Step 2: Character Movement

## Phase 1: Analyze Current Movement Logic
- Review existing `content.js` code for random target generation and movement.
- Identify key functions: `randomTarget()`, `chooseNextTarget()`, `updateBuddyPosition()`, `tick()`.
- Understand current behavior: random targets with minimum distance check (150px), 3s rest after arrival.
- Confirm sprite flipping is working based on horizontal direction.

## Phase 2: Modify Target Selection for Controlled Movement
- Change `randomTarget()` to generate targets within a smaller radius (e.g., 200-300px from current position) instead of full viewport.
- Ensure targets are chosen to allow 1-2 second leisurely travel at current speed (80px/sec).
- Remove or adjust the minimum distance loop since targets will be closer by design.
- Update console logs to reflect new target selection logic.

## Phase 3: Implement Linear Movement with Pauses
- Ensure `updateBuddyPosition()` handles smooth linear interpolation (already using `lerp`).
- Confirm pause logic: after reaching target, set `moving = false` and `nextDecisionTime = now + 3000` (3s pause).
- Adjust decision timing in `tick()` to trigger new target selection after pause.
- Test movement smoothness and pause duration.

## Phase 4: Refine Facing Direction Logic
- Verify horizontal-only facing: `dx < 0` → facing left (`scaleX(-1)`), `dx > 0` → facing right (`scaleX(1)`).
- Ignore vertical movement (`dy`) for facing direction.
- Ensure `updateBuddyStyle()` applies the correct transform with facing.
- Test facing changes during movement transitions.

## Phase 5: Testing and Validation
- Load extension in Chrome and observe movement on various websites.
- Verify 1-2 second travel times for short distances.
- Check console logs for target selection and movement events.
- Test facing direction changes accurately reflect horizontal movement.
- Ensure no hyperactivity or invisibility issues from previous fixes.
- Adjust parameters (speed, pause time, target radius) if needed for optimal leisurely movement.

## Phase 6: Documentation and Cleanup
- Update PROMPT.md with implementation notes if necessary.
- Ensure all code is commented and clean.
- Commit changes with descriptive message. 