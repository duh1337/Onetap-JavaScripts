UI.AddSubTab(["Config", "SUBTAB_MGR"], "Custom Fakelag");
const path = ["Config","SUBTAB_MGR","Custom Fakelag", "Custom Fakelag"]
const get = UI.GetValue; const enable = UI.SetEnabled

function getDropdownValue(value, index)
{
    var mask = 1 << index;
    return value & mask ? true : false;
}

function on_load() {


    const alt_opts = ["Standing", "Moving", "In air", "Slow walk"]
    const ui = {
        enabled : UI.AddCheckbox(path, "Enable fakelag"),
        b_amount : UI.AddDropdown(path, "Amount", ["Adaptive","Maximum","Random","Fluctuate","Alternative"],0),
        b_jitter : UI.AddSliderFloat(path, "Jitter strength", 0.2, 1),
        //triggers : UI.AddCheckbox(path, "Triggers"),
        n_limit : UI.AddSliderInt(path, "Normal limit", 1, 14),
        alt_conds : UI.AddMultiDropdown(path, "Alternative conditions",alt_opts),
        send_l : UI.AddSliderInt(path, "Send limit", 1, 14),
        choke_l : UI.AddSliderInt(path, "Choke limit", 1, 14),
        ind : UI.AddCheckbox(path, "Fakelag indicator")
    }

    return ui
}

const extend_vector = function(pos,length,angle) {
    var rad = angle * Math.PI / 180
    return [pos[0] + (Math.cos(rad) * length),pos[1] + (Math.sin(rad) * length), pos[2]];
  }


const extrapolate_position = function(position,entity,ticks,no_collision) {
    const simulation_data = {
        on_ground : Entity.GetProp(entity,"CBasePlayer","m_hGroundEntity") != "m_hGroundEntity",

        velocity : Entity.GetProp(entity,"CBasePlayer","m_vecVelocity[0]"),
        origin : position,
    }
    const simulate_movement = function(record) {
        const sv_gravity = Convar.GetInt("sv_gravity")

        const data = record
        const predicted_origin = data.origin
    
        if (!data.on_ground && !no_collision) {
            const gravity_per_tick = sv_gravity/ Globals.Tickrate()
            data.velocity[2] = data.velocity[2] - gravity_per_tick
        }

        predicted_origin = [
            predicted_origin[0] + (data.velocity[0] / Globals.Tickrate()),
            predicted_origin[1] + (data.velocity[1] / Globals.Tickrate()),
            predicted_origin[2] + (!data.on_ground ? (data.velocity[2] / Globals.Tickrate()) : 0)
        ]

        const fraction = Trace.Line(entity,data.origin,predicted_origin)[1]
        const ground_fraction = Trace.Line(entity,data.origin, [data.origin[0],data.origin[1],data.origin[2]-10])[1]
        if (no_collision || fraction > 0.90 ) {
            data.origin = predicted_origin
            data.on_ground = (ground_fraction < 0.6)
        }
    
        return data
    }

    if (ticks > 0) {
        for (ticks_left = 0; ticks_left < ticks; ticks_left++) {
            simulation_data = simulate_movement(simulation_data)
            
        }
        return simulation_data
    }
}


function get_velocity(entity) {
    velocity = Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]");
    speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
    return speed;
}

function get_velocity_3d(entity) {
    velocity = Entity.GetProp(entity, "CBasePlayer", "m_vecVelocity[0]");
    speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1] + velocity[2] * velocity[2]);
    return speed;
}

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Render.OutlinedString = function(x,y,centered,text,color,font,double_shadow) {
    Render.String(x+1, y+1, centered, text, [0,0,0,255], font)
    Render.String(x+1, y-1, centered, text, [0,0,0,255], font)
    Render.String(x+1, y, centered, text, [0,0,0,255], font)
    Render.String(x-1, y+1,centered, text, [0,0,0,255], font)
    Render.String(x-1, y-1,centered, text, [0,0,0,255], font)
    Render.String(x-1, y,centered, text, [0,0,0,255], font)
    Render.String(x, y+1, centered, text, [0,0,0,255], font)
    Render.String(x, y-1, centered, text, [0,0,0,255], font)
    if (double_shadow) {
        Render.String(x+1, y+2, centered, text, [0,0,0,255], font)
        Render.String(x-1, y+2,centered, text, [0,0,0,255], font)
        Render.String(x, y+2,centered, text, [0,0,0,255], font)
    }

    Render.String(x, y, centered, text, color, font)
}
var last_choked = 0; var send = 0; var predicted_pos; var predicted_pos2; var extended_pos; var extended_pos2
function handle_fakelag() {
    if (!get(ui.enabled))
        return;
    const me = Entity.GetLocalPlayer()
    const limit = get(ui.n_limit)
    const limit_s = 1
    const trigger_active = false
	local_yaw = Local.GetRealYaw();
    velocity = get_velocity_3d(me)
    local_yaw = Globals.ChokedCommands() == 0 ? Entity.GetProp(me,"CCSPlayer" , "m_angEyeAngles")[1] : local_yaw

    pos = Entity.GetEyePosition(me)
    extended_pos = extend_vector(pos,50,local_yaw)
    switch (get(ui.b_amount)) {
        case 0:
            const distance_per_tick = velocity * Globals.TickInterval();
            const choked_ticks = Math.ceil(64 / distance_per_tick);
            limit = Math.min(choked_ticks, limit);
            break;
    
        case 2:
            limit = limit - random(0,limit)*get(ui.b_jitter)
            break;
    
        case 3:
            const is_in_air = Entity.GetProp(me,"CBasePlayer","m_hGroundEntity") == "m_hGroundEntity"
            if (is_in_air) {
                const distance_per_tick = velocity * Globals.TickInterval();
                const choked_ticks = Math.ceil(64 / distance_per_tick);
                limit = Math.min(choked_ticks, limit);
            }
            else if (velocity < 1.25) {
                limit = Globals.Tickcount() % 128 < 15 ? 15 : 0
            }
            else limit_s = velocity/96 + 2
            break;
        
        case 4:
            const is_standing = velocity < 1.25 && getDropdownValue(get(ui.alt_conds),0) && Entity.GetProp(me,"CBasePlayer","m_hGroundEntity") != "m_hGroundEntity"
            const is_moving = velocity >= 1.25 && getDropdownValue(get(ui.alt_conds),1) && Entity.GetProp(me,"CBasePlayer","m_hGroundEntity") != "m_hGroundEntity"
            const is_in_air = Entity.GetProp(me,"CBasePlayer","m_hGroundEntity") == "m_hGroundEntity" && getDropdownValue(get(ui.alt_conds),2)
            const is_slow_walking = get(["Rage","Anti Aim","General","Key assignment","Slow walk"]) && getDropdownValue(get(ui.alt_conds),3)

            if (is_standing || is_moving || is_in_air || is_slow_walking) {
                limit = get(ui.choke_l)
                limit_s = get(ui.send_l)
            }
            break;
    }

    const ticks1 = velocity > 15 ? 128/(velocity*Globals.TickInterval()) : 1
    const ticks2 = velocity > 15 ? 16/(velocity*Globals.TickInterval()) : 1
    predicted_pos = extrapolate_position(Entity.GetRenderOrigin(me),me,ticks2,false).origin
    predicted_pos2 = extrapolate_position(Entity.GetRenderOrigin(me),me,ticks1,false).origin

    offset = Entity.GetProp(me,"CBasePlayer" , "m_vecViewOffset[2]")[0]
    predicted_pos = [predicted_pos[0],predicted_pos[1],predicted_pos[2] + offset]
    predicted_pos2 = [predicted_pos2[0],predicted_pos2[1],predicted_pos2[2] + offset]

    yaw = Local.GetViewAngles()[1]
    extended_pos = extend_vector(predicted_pos,250,yaw)
    extended_pos2 = extend_vector(predicted_pos2,250,yaw)

    fraction1 = Trace.Line(me,predicted_pos, extended_pos)[1]
    fraction2 = Trace.Line(me,predicted_pos2,extended_pos2)[1]

    if (fraction1 + 0.2 < fraction2) trigger_active = true

    if (Ragebot.GetTargets() != "") {
        trigger_active = false
        limit = 14
        limit_s = 1
    }
 
    if (Globals.ChokedCommands() < last_choked) {
        fl_info._3 = fl_info._2
        fl_info._2 = fl_info._1
        fl_info._1 = fl_info._0
        fl_info._0 = last_choked
    }
    if (Globals.ChokedCommands() < limit && send > limit_s && !trigger_active) {
        UserCMD.Choke() 
    }
    else {
        send > limit_s ? send = 1 : send++
        UserCMD.Send()
    }
    last_choked = Globals.ChokedCommands()
}
var font; var ss
const fl_info = {
    _0 : 0,
    _1 : 0,
    _2 : 0,
    _3 : 0,
}

function drawFakelag() {

    if (get(ui.b_amount) == 4) {
        enable(ui.alt_conds,1)
        enable(ui.choke_l,1)
        enable(ui.send_l,1)
    }
    else {
        enable(ui.alt_conds,0)
        enable(ui.choke_l,0)
        enable(ui.send_l,0)
    }
    if (get(ui.b_amount) == 2) enable(ui.b_jitter,1)
    else enable(ui.b_jitter,0)

    if (!get(ui.enabled) || !Entity.IsAlive(Entity.GetLocalPlayer()))
        return;

    if (!font)
        font = Render.GetFont('calibrib.ttf', 24, true);
    
    var ss = {
        x : Render.GetScreenSize()[0],
        y : Render.GetScreenSize()[1],
    }

    if (!get(ui.ind))
        return;
    textsize = Render.TextSize(fl_info._3 +" - "+fl_info._2 +" - " + fl_info._1 +" - " + fl_info._0, font)
    Render.GradientRect(ss.x/115, ss.y-300-5, textsize[0]/2 , textsize[1]+10, 1, [0,0,0,0], [0,0,0,55])
    Render.GradientRect(ss.x/115 + textsize[0]/2-1, ss.y-300-5, textsize[0]/2 , textsize[1]+10, 1, [0,0,0,55], [0,0,0,0])
    Render.String(ss.x/115-1, ss.y-299, 0, fl_info._3 +" - "+fl_info._2 +" - " + fl_info._1 +" - " + fl_info._0, [15,15,15,155], font)
    Render.String(ss.x/115, ss.y-300, 0, fl_info._3 +" - "+fl_info._2 +" - " + fl_info._1 +" - " + fl_info._0, [255,255,255,255], font)
}

const ui = on_load()

Cheat.RegisterCallback("CreateMove","handle_fakelag")
Cheat.RegisterCallback("Draw","drawFakelag")
