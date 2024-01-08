// ----------------------------------- CONSTANTS -----------------------------------
const k_f = 0.00141446535;
const k_m = 0.0004215641;
const L = 0.23;
const l = (L / Math.sqrt(2));
const loc_I = [0.0121, 0.0223, 0.0119];
const g = 9.81;
const m = 1.0;
const omega_min = 20
const omega_max = 66

// ----------------------------------- DYNAMICS -----------------------------------
var omega_1 = 41.67;
var omega_2 = 41.65;
var omega_3 = 41.65;
var omega_4 = 41.65;

var glob_rot_vel = [0.0, 0.0, 0.0];
var glob_rot_pos = [0.0, 0.0, 0.0];
var glob_lin_vel = [0.0, 0.0, 0.0];
var glob_lin_pos = [0.0, 0.2, 0.0];

setInterval(function () {

	let F1 = k_f * omega_1 * omega_1;
	let F2 = k_f * omega_2 * omega_2;
	let F3 = k_f * omega_3 * omega_3;
	let F4 = k_f * omega_4 * omega_4;

	let M1 = k_m * omega_1 * omega_1;
	let M2 = k_m * omega_2 * omega_2;
	let M3 = k_m * omega_3 * omega_3;
	let M4 = k_m * omega_4 * omega_4;

	let R = transpMat3f(multMat3f(multMat3f(xRotMat3f(glob_rot_pos[0]), yRotMat3f(glob_rot_pos[1])), zRotMat3f(glob_rot_pos[2])));

	// --- THRUST AND POSITION ---
	glob_lin_vel = addVec3f(glob_lin_vel, multScalVec3f(dt, subVec3f(multScalVec3f(1 / m, multMatVec3f(R, [0, (F1 + F2 + F3 + F4), 0])), [0, g, 0])));
	glob_lin_pos = addVec3f(glob_lin_pos, multScalVec3f(dt, glob_lin_vel));

	// --- TORQUE AND ROTATION ---
	let loc_torque = [0, 0, 0];
	let tau_1f = crossVec3f([-l, 0, l], [0, F1, 0]);
	let tau_1m = crossVec3f([-l, 0, l], [M1, 0, 0]);
	let tau_2f = crossVec3f([l, 0, l], [0, F2, 0]);
	let tau_2m = crossVec3f([l, 0, l], [-M2, 0, 0]);
	let tau_3f = crossVec3f([l, 0, -l], [0, F3, 0]);
	let tau_3m = crossVec3f([l, 0, -l], [M3, 0, 0]);
	let tau_4f = crossVec3f([-l, 0, -l], [0, F4, 0]);
	let tau_4m = crossVec3f([-l, 0, -l], [-M4, 0, 0]);
	loc_torque = addVec3f(loc_torque, tau_1f);
	loc_torque = addVec3f(loc_torque, tau_1m);
	loc_torque = addVec3f(loc_torque, tau_2f);
	loc_torque = addVec3f(loc_torque, tau_2m);
	loc_torque = addVec3f(loc_torque, tau_3f);
	loc_torque = addVec3f(loc_torque, tau_3m);
	loc_torque = addVec3f(loc_torque, tau_4f);
	loc_torque = addVec3f(loc_torque, tau_4m);
	let glob_torque = multMatVec3f(R, loc_torque);


	//let glob_I = multMatVec3f(R, loc_I);
	let glob_I_mat = vecToDiagMat3f(loc_I);
	let glob_I_mat_inv = invMat3f(glob_I_mat);

	let glob_rot_acc = addVec3f(glob_rot_vel, multScalVec3f(dt, addVec3f(glob_rot_vel, multScalVec3f(dt, multMatVec3f(glob_I_mat_inv, subVec3f(glob_torque, crossVec3f(glob_rot_vel, multMatVec3f(glob_I_mat, glob_rot_vel))))))));
	glob_rot_vel = addVec3f(glob_rot_vel, multScalVec3f(dt, glob_rot_acc));
	glob_rot_pos = addVec3f(glob_rot_pos, multScalVec3f(dt, glob_rot_vel));

	// --- UPDATE MODEL MATRIX ---
	droneModelMatrix = modelMat4f(glob_lin_pos[0], glob_lin_pos[1], glob_lin_pos[2], glob_rot_pos[0], glob_rot_pos[1], glob_rot_pos[2], 0.01, 0.01, 0.01);

	console.log(Math.floor(glob_lin_pos[0] * 100) / 100, Math.floor(glob_lin_pos[1] * 100) / 100, Math.floor(glob_lin_pos[2] * 100) / 100);

	if (glob_lin_pos[0] > 1 || glob_lin_pos[0] < -1 || glob_lin_pos[1] > 1 || glob_lin_pos[1] < -1 || glob_lin_pos[2] > 1 || glob_lin_pos[2] < -1) {
		glob_rot_vel = [0.0, 0.0, 0.0];
		glob_rot_pos = [0.0, 0.0, 0.0];
		glob_lin_vel = [0.0, 0.0, 0.0];
		glob_lin_pos = [0.0, 0.2, 0.0];
	}


}, dt * 1000/*dt * 1000*/);
