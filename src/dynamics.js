// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.00141446535; // includes earth's gravitation already on the air molecules (?)
const k_m = 0.000001215641; // includes earth's gravitation already
const L = 0.23;
const l = (L / Math.sqrt(2));
const I = [0.0121, 0.0223, 0.0119]; // includes mass already
const loc_I_mat = vecToDiagMat3f(I);
const loc_I_mat_inv = invMat3f(loc_I_mat);
const glob_g = [0.0, -9.81, 0.0];

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 525.96;
var omega_2 = 525.96;
var omega_3 = 525.96;
var omega_4 = 525.96;

var loc_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_pos = [0.0, 0.0, 0.0];
var glob_lin_vel = [0.0, 0.0, 0.0];
var glob_lin_pos = [0.0, 0.2, 0.0];

setInterval(function () {

	let R = multMat3f(multMat3f(xRotMat3f(glob_rot_pos[0]), yRotMat3f(glob_rot_pos[1])), zRotMat3f(glob_rot_pos[2]));
	let R_T = transpMat3f(R);

	let F1_up = k_f * omega_1 * omega_1;
	let F2_up = k_f * omega_2 * omega_2;
	let F3_up = k_f * omega_3 * omega_3;
	let F4_up = k_f * omega_4 * omega_4;
	let F1_rot = k_m * omega_1 * omega_1;
	let F2_rot = k_m * omega_2 * omega_2;
	let F3_rot = k_m * omega_3 * omega_3;
	let F4_rot = k_m * omega_4 * omega_4;

	// LIN
	let tau_1 = crossVec3f([-l, 0.25 * l, l], [F1_rot / 2, F1_up, F1_rot / 2]);
	let tau_2 = crossVec3f([l, 0.25 * l, l], [F2_rot / 2, F2_up, -F2_rot / 2]);
	let tau_3 = crossVec3f([l, 0.25 * l, -l], [-F3_rot / 2, F3_up, -F3_rot / 2]);
	let tau_4 = crossVec3f([-l, 0.25 * l, -l], [-F4_rot / 2, F4_up, F4_rot / 2]);

	let loc_torque = [0, 0, 0];
	loc_torque = addVec3f(loc_torque, tau_1);
	loc_torque = addVec3f(loc_torque, tau_2);
	loc_torque = addVec3f(loc_torque, tau_3);
	loc_torque = addVec3f(loc_torque, tau_4);

	let loc_lin_acc = multMatVec3f(loc_I_mat_inv, subVec3f(loc_torque, crossVec3f(loc_rot_vel, multMatVec3f(loc_I_mat, loc_rot_vel))));
	glob_lin_acc = multMatVec3f(R_T, loc_lin_acc);
	glob_lin_acc = addVec3f(glob_lin_acc, glob_g);
	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, glob_lin_acc));
	glob_lin_pos = addVec3f(glob_lin_pos, multScalVec3f(dt, glob_lin_vel));
	console.log(glob_lin_pos);

	// ROT
	let acc_1 = crossVec3f(glob_lin_acc, [-l, 0.25 * l, l]);
	let acc_2 = crossVec3f(glob_lin_acc, [l, 0.25 * l, l]);
	let acc_3 = crossVec3f(glob_lin_acc, [l, 0.25 * l, -l]);
	let acc_4 = crossVec3f(glob_lin_acc, [-l, 0.25 * l, -l]);
	let glob_rot_acc = [0, 0, 0];
	glob_rot_acc = addVec3f(glob_rot_acc, acc_1);
	glob_rot_acc = addVec3f(glob_rot_acc, acc_2);
	glob_rot_acc = addVec3f(glob_rot_acc, acc_3);
	glob_rot_acc = addVec3f(glob_rot_acc, acc_4);

	glob_rot_vel = addVec3f(glob_rot_vel, multScalVec3f(dt, glob_rot_acc));
	glob_rot_pos = addVec3f(glob_rot_pos, multScalVec3f(dt, glob_rot_vel));

	// --- UPDATE MODEL MATRIX ---
	droneModelMatrix = modelMat4f(glob_lin_pos[0], glob_lin_pos[1], glob_lin_pos[2], glob_rot_pos[0], glob_rot_pos[1], glob_rot_pos[2], 0.01, 0.01, 0.01);

	if (glob_lin_pos[0] > 1 || glob_lin_pos[0] < -1 || glob_lin_pos[1] > 1 || glob_lin_pos[1] < -1 || glob_lin_pos[2] > 1 || glob_lin_pos[2] < -1) {
		loc_rot_vel = [0.0, 0.0, 0.0];
		glob_rot_vel = [0.0, 0.0, 0.0];
		glob_rot_pos = [0.0, 0.0, 0.0];
		glob_lin_vel = [0.0, 0.0, 0.0];
		glob_lin_pos = [0.0, 0.2, 0.0];
	}

}, dt * 1000);
