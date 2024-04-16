// ----------------------------------- CONTROL PARAMETERS -----------------------------------
const Kp_pitch = 0.7;
const Kd_pitch = 0.5;

const Kp_yaw = 0.1;
const Kd_yaw = 0.01;

var desired_loc_rot_pos = [0.0, 0.0, 0.0];
var desired_loc_rot_vel = [0.0, 0.0, 0.0];
var desired_loc_rot_acc = [0.0, 0.0, 0.0];

var desired_loc_lin_pos = [0.0, 0.0, 0.0];
var desired_loc_lin_vel = [0.0, 0.0, 0.0];
var desired_loc_lin_acc = [0.0, 0.0, 0.0];

var desired_glob_lin_pos = [0.0, 1.0, 0.0];
var desired_glob_lin_vel = [0.0, 0.0, 0.0];
var desired_glob_lin_acc = [0.0, 0.0, 0.0];

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- PITCH INPUT ---
    if (keys["w"]) {
        desired_loc_rot_vel[0] = -0.1; // Forward
    } else if (keys["s"]) {
        desired_loc_rot_vel[0] = 0.1; // Backward
    } else {
        desired_loc_rot_vel[0] = 0.0;
    }

    // --- YAW INPUT ---
    if (keys["q"]) {
        desired_loc_rot_vel[1] = -0.2; // Turn left
    } else if (keys["e"]) {
        desired_loc_rot_vel[1] = 0.2; // Turn right
    } else {
        desired_loc_rot_vel[1] = 0.0;
    }

    // --- CONTROL ---
    let pitch_control = Kp_pitch * (desired_loc_rot_vel[0] - loc_rot_vel[0]) + Kd_pitch * (desired_loc_rot_acc[0] - loc_rot_vel[0]);
    let yaw_control = Kp_yaw * (desired_loc_rot_vel[1] - loc_rot_vel[1]) + Kd_yaw * (desired_loc_rot_acc[1] - loc_rot_vel[1]);
    console.log(glob_lin_pos);
    // --- MOTOR COMMANDS ---
    /*
    omega_1 = omega_stable - yaw_control;// + pitch_control;
    omega_2 = omega_stable + yaw_control;// + pitch_control;
    omega_3 = omega_stable - yaw_control;// - pitch_control;
    omega_4 = omega_stable + yaw_control;// - pitch_control;
    */

}, dt * 10);
