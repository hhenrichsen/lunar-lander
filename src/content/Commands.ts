import { CommandService } from "../core/Command";
import { GlobalState, PlayState } from "./State";

export function buildCommands(
  state: GlobalState<PlayState>
): CommandService<GlobalState<PlayState>> {
  const commands = new CommandService<GlobalState<PlayState>>();
  commands.createCommand("changeThrustControl", (state) => {
    state.keys.remove
  })

  commands.createCommand("beginThrust", (state) => {
    if (state.localState.lander.frozen) return;
    state.localState.lander.thrusting = true;
    if (state.localState.lander.fuel > 0) {
      state.sounds.mainThruster.play();
    } else {
      state.sounds.noFuel.play();
    }
  });

  commands.createCommand("endThrust", (state) => {
    state.localState.lander.thrusting = false;
    state.sounds.mainThruster.stop();
    state.sounds.noFuel.stop();
  });

  commands.createCommand("fuelExpired", (state) => {
    if (state.localState.lander.frozen) return;
    if (state.sounds.mainThruster.playing) {
      state.sounds.mainThruster.stop();
      state.sounds.noFuel.play();
    }
    if (state.sounds.subThruster.playing) {
      state.sounds.subThruster.stop();
      state.sounds.noFuel.play();
    }
  });

  commands.createCommand("beginTurnLeft", (state) => {
    if (state.localState.lander.frozen) return;
    state.localState.lander.turningLeft = true;
    if (state.localState.lander.fuel > 0) {
      state.sounds.subThruster.play();
    } else {
      state.sounds.noFuel.play();
    }
  });

  commands.createCommand("endTurnLeft", (state) => {
    if (state.localState.lander.frozen) return;
    state.sounds.subThruster.stop();
    state.sounds.noFuel.stop();
    state.localState.lander.turningLeft = false;
  });

  commands.createCommand("beginTurnRight", (state) => {
    if (state.localState.lander.frozen) return;
    if (state.localState.lander.fuel > 0) {
      state.sounds.subThruster.play();
    } else {
      state.sounds.noFuel.play();
    }
    state.localState.lander.turningRight = true;
  });

  commands.createCommand("endTurnRight", (state) => {
    if (state.localState.lander.frozen) return;
    state.sounds.subThruster.stop();
    state.sounds.noFuel.stop();
    state.localState.lander.turningRight = false;
  });

  commands.createCommand("safeLanding", (state) => {
    state.sounds.landing.play();
    state.localState.lander.freeze();
    state.localState.transition = true;
    setTimeout(() => {
      state.localState.running = false;
      state.localState.score += (state.localState.lander.fuel * state.localState.level);
      if (state.localState.level == 2) {
        state.router.requestTransition('scores', true, {score: state.localState.score});
      }
      else {
        state.router.requestTransition('play', true, {level: 2, score: state.localState.score});
      }
    }, 3000);
  });

  commands.createCommand("crashLanding", (state) => {
    state.sounds.mainThruster.stop();
    state.sounds.subThruster.stop();
    state.sounds.noFuel.stop();
    state.sounds.explosion.play();
    state.localState.lander.crashed = true;
    state.localState.lander.freeze();
    setTimeout(() => {
      state.localState.running = false;
      state.router.requestTransition('scores', true, { score: state.localState.score });
    }, 3000);
  });

  return commands;
}