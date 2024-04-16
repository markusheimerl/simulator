// ----------------------------------- CONTROL PARAMETERS -----------------------------------
const Kp_roll = 1.0;
const Kp_pitch = 1.0;
const Kp_yaw = 1.0;
const Kp_alt = 3.0;
const Kd_alt = 1.8;
var desired_loc_rot_pos = [0.0, 0.0, 0.0];
var desired_loc_rot_vel = [0.0, 0.0, 0.0];
var desired_loc_rot_acc = [0.0, 0.0, 0.0];

var desired_loc_lin_pos = [0.0, 0.0, 0.0];
var desired_loc_lin_vel = [0.0, 0.0, 0.0];
var desired_loc_lin_acc = [0.0, 0.0, 0.0];

var desired_glob_lin_pos = [0.0, 0.2, 0.0];
var desired_glob_lin_vel = [0.0, 0.0, 0.0];
var desired_glob_lin_acc = [0.0, 0.0, 0.0];

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    // --- USER INPUT ---
    if (keys["x"]) {
        desired_loc_lin_vel[1] = 0.1; // Up
    } else if (keys["z"]) {
        desired_loc_lin_vel[1] = -0.1; // Down
    } else {
        desired_loc_lin_vel[1] = 0.0;
    }

    // --- ALTITUDE CONTROL ---
    let alt_control = Kp_alt * (desired_loc_lin_vel[1] - loc_lin_vel[1]) + Kd_alt * (desired_loc_lin_acc[1] - loc_lin_acc[1]);

    // --- MOTOR COMMANDS ---
    omega_1 = omega_stable + alt_control;
    omega_2 = omega_stable + alt_control;
    omega_3 = omega_stable + alt_control;
    omega_4 = omega_stable + alt_control;

}, dt * 10);





/*
    if (keys["w"]) {
        desired_loc_rot_pos[0] = 0.1; // Pitch forward
    } else if (keys["s"]) {
        desired_loc_rot_pos[0] = -0.1; // Pitch backward
    } else {
        desired_loc_rot_pos[0] = 0.0;
    }

    if (keys["a"]) {
        desired_loc_rot_pos[2] = 0.1; // Roll left
    } else if (keys["d"]) {
        desired_loc_rot_pos[2] = -0.1; // Roll right
    } else {
        desired_loc_rot_pos[2] = 0.0;
    }

    if (keys["e"]) {
        desired_loc_rot_pos[1] = 0.1; // Yaw left (counterclockwise)
    } else if (keys["q"]) {
        desired_loc_rot_pos[1] = -0.1; // Yaw right (clockwise)
    } else {
        desired_loc_rot_pos[1] = 0.0;
    }

    // --- PITCH CONTROL ---
    let pitch_error_pos = desired_loc_rot_pos[0] - loc_rot_pos[0];
    let pitch_control = Kp_pitch * pitch_error_pos;

    // --- ROLL CONTROL ---
    let roll_error_pos = desired_loc_rot_pos[2] - loc_rot_pos[2];
    let roll_control = Kp_roll * roll_error_pos;

    // --- YAW CONTROL ---
    let yaw_error_pos = desired_loc_rot_pos[1] - loc_rot_pos[1];
    let yaw_control = Kp_yaw * yaw_error_pos;

    */