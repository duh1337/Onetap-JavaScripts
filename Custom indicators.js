UI.AddSubTab(["Config", "SUBTAB_MGR"], "Indicators")
var path = ["Config", "Indicators", "SHEET_MGR", "Indicators"]
var ind_enb = UI.AddCheckbox(path, "Enable indicators")
var ind_type = UI.AddDropdown(path, "Indicators type", ["Acatel", "Prediction", "Ideal yaw", "Killaura", "Invictus"], 0)
//Prediction stuff
var pred_list = UI.AddMultiDropdown(path,"Indicators to show", [ "Script name", "Arrows", "Anti aim status", "Doubletap", "Hide shots" , "Force body aim", "Force safe point" , "Quick peek" , "Freestanding" ] )
var color_pred = UI.AddColorPicker(path, "Main color")
var color_pred_sec = UI.AddColorPicker(path, "Accent color")
// Killaura stuff
var color_ka = UI.AddColorPicker(path, "Script name color")
var color_ka_sec = UI.AddColorPicker(path, "Text color")
// Invictus stuff
var color_inv = UI.AddColorPicker(path, "Primary color")
var color_inv_sec = UI.AddColorPicker(path, "Secondary color")
var color_inv_arrows = UI.AddColorPicker(path, "Arrows color")

var choked_com = Globals.ChokedCommands()

function clamp(num, min, max) { // clamp angles
    return num <= min ? min : num >= max ? max : num;
}

function render_outline_string(x, y, centered, text, color, font, ds) {
    Render.String(x + 1, y + 1, centered, text, [0, 0, 0, 255], font)
    Render.String(x + 1, y - 1, centered, text, [0, 0, 0, 255], font)
    Render.String(x + 1, y, centered, text, [0, 0, 0, 255], font)
    Render.String(x - 1, y + 1, centered, text, [0, 0, 0, 255], font)
    Render.String(x - 1, y - 1, centered, text, [0, 0, 0, 255], font)
    Render.String(x - 1, y, centered, text, [0, 0, 0, 255], font)
    Render.String(x, y + 1, centered, text, [0, 0, 0, 255], font)
    Render.String(x, y - 1, centered, text, [0, 0, 0, 255], font)
    if (ds) {
        Render.String(x + 1, y + 2, centered, text, [0, 0, 0, 255], font)
        Render.String(x - 1, y + 2, centered, text, [0, 0, 0, 255], font)
        Render.String(x, y + 2, centered, text, [0, 0, 0, 255], font)
    }
    Render.String(x, y, centered, text, color, font)
}

function elpepe(){
	
	var x = Render.GetScreenSize()[0]/2
	var y = Render.GetScreenSize()[1]/2
	var font = Render.GetFont("Smallest_Pixel-7.ttf", 10, true)
	var font_pred = Render.GetFont("Verdanab.ttf", 10.5, true)
	var font_iy = Render.GetFont("Verdana.ttf", 10.5, true)
	var font_iy_arrows = Render.GetFont("Verdana.ttf", 17, true)
	var font_ka = Render.GetFont("Smallest_Pixel-7.ttf", 10, true)
	var font_inv = Render.GetFont("Calibri.ttf", 11, true)
	var font_inv_arrows = Render.GetFont("Arialbd.ttf", 19, true)
	var custom_arrows = Render.GetFont("Acta_symbols_w95_arrows.ttf", 20, true)
	//prediction get colors
	var pred_main = UI.GetColor(color_pred)
	var pred_acc = UI.GetColor(color_pred_sec)
	var aa_pred_acc = UI.GetColor(color_pred_sec)
	//killaura get colors
	var killaura_title = UI.GetColor(color_ka)
	var killaura_acc = UI.GetColor(color_ka_sec)
	//invictus get colors
	var inv_color = UI.GetColor(color_inv)
	var inv_color_sec = UI.GetColor(color_inv_sec)
	var inv_color_arrows = UI.GetColor(color_inv_arrows)
	
	var yop = Entity.GetLocalPlayer();
	var flags = Entity.GetProp(yop,"CBasePlayer" ,"m_fFlags")
	
	var fake = Local.GetFakeYaw();
    var real = Local.GetRealYaw();
    var dsy_m = Math.min(Math.abs(real - fake) / 2, 58).toFixed(0);
    dsy_final= Number(dsy_m);

	var dsy = Local.GetRealYaw() - Local.GetFakeYaw();
    var dsy_round = Math.round(dsy);
    var dsy_clamp = clamp(dsy_round, -60, 60);
    var dsy_m = Number(dsy_clamp);
    var dsy_clamp_2 = clamp(dsy_round, 0, 60);
    var dsy_final_2 = Number(dsy_clamp);

	var fakeyaw_text = "-"
	var separator = 0
	
	var baim_color = [120, 120, 120, 255]
	var sp_color = [120, 120, 120, 255]
	var freestanding_color = [120, 120, 120, 255]

	if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"]) == true){
		baim_color = [255, 255, 255, 255]
	}
	
	if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Force safe point"]) == true){
		sp_color = [255,255,255,255]
	}
	
	if (UI.GetValue(["Rage", "Anti Aim", "Directions", "Auto direction"]) == 1) {
		freestanding_color = [255, 255, 255, 255]
	}
	
	if (dsy_final>= 10) {
		fakeyaw_text = "L"
	}else{
		fakeyaw_text = "R"
	}
	
	if (UI.GetValue(ind_enb)){
		if (Entity.IsAlive(yop)) {
			
			// ACATEL INDICATORS
			if (UI.GetValue(ind_type) == 0) {
				// script name 
				render_outline_string(x, y + 30, 0, "SINISTER", [255, 255, 255,255], font)
				render_outline_string(x + 38, y + 30, 0, "LUA", [255, 150, 150, 255], font)
				
				// Fake yaw indicator
				render_outline_string(x, y + 38.5, 0, "FAKE", [160, 160, 250, 255], font)
				render_outline_string(x + 21, y + 38.5, 0, "YAW:", [160, 160, 250, 255], font) // Con espacio queda muy separado por eso renderizo FAKE y YAW aparte :v
				
				render_outline_string(x + 39, y + 38.5, 0, fakeyaw_text, [255, 255, 255, 255], font)
				
				if(Exploit.GetCharge() == 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					separator = separator + 8
					render_outline_string(x, y + 46, 0, "DT", [0, 255, 0, 255], font)
					
				}else if (Exploit.GetCharge() < 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					separator = separator + 8
					render_outline_string(x, y + 46, 0, "DT", [255, 0, 0, 255], font)
				}
				// BAIM
				render_outline_string(x, y + 46 + separator, 0, "BAIM", baim_color, font)
				// SAFE POINT
				render_outline_string(x + 23, y + 46 + separator, 0, "SP", sp_color, font)
				// FREESTANDING -- no hay keybind de freestanding en onetap btw XD!
				render_outline_string(x + 35, y + 46 + separator, 0, "FS", freestanding_color, font)
			}
			
			// PREDICTION INDICATORS
			if (UI.GetValue(ind_type) == 1) {
				
				dt_color = pred_main
				hs_color = pred_main
				baim_color = pred_main
				sp_color = pred_main
				autopeek_color = pred_main
				fs_color = pred_main
				var aa_status = "DYNAMIC-"
				
				if (flags == 256)
				{
					aa_status = "AEROBIC^"
				}
				else if (Entity.GetProp(yop, "CCSPlayer", "m_flDuckAmount") > 0.8 )
				{
					aa_status = "TANK"
				}
				else if(UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Slow walk"]))
				{
					aa_status = "DANGEROUS"
					aa_pred_acc = [255, 0 , 0, 255]
				}
				else
				{
					aa_status = "DYNAMIC-"
				}
				
				
				if(Exploit.GetCharge() == 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					dt_color = pred_acc
					
				}else if (Exploit.GetCharge() < 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					dt_color = [255,0,0,255]
				}
				
				if (UI.GetValue(["Rage", "Exploits", "Keys", "Key assignment", "Hide shots"])) {
					hs_color = pred_acc
				}
				if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"])) {
					baim_color = pred_acc
				}
				if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Force safe point"])) {
					sp_color = pred_acc
				}
				if (UI.GetValue(["Misc.", "Keys", "Key assignment", "Auto peek"])) {
					autopeek_color = pred_acc
				}
				
				if (UI.GetValue(["Rage", "Anti Aim", "Directions", "Auto direction"]) == 1) {
					fs_color = pred_acc
				}
				
				
				
				if (UI.GetValue(pred_list) & (1 << 0) ) {
					separator = separator + 8
					if (dsy_final>= 10) {
						render_outline_string(x - 11, y + 30, 1, "sini", pred_main, font_pred)
						render_outline_string(x, y + 30, 0, "ster", pred_acc, font_pred)
					}else{
						render_outline_string(x - 11, y + 30, 1, "sini", pred_acc, font_pred)
						render_outline_string(x, y + 30, 0, "ster", pred_main, font_pred)
					}
				}
				
				if (UI.GetValue(pred_list) & (1 << 1) ) {
					Render.String(x - 50, y - 7, 1, "w", pred_main, custom_arrows)
					Render.String(x + 50, y - 7, 1, "x", pred_main, custom_arrows)
				}
				
				if (UI.GetValue(pred_list) & (1  << 2) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, aa_status, aa_pred_acc, font)
				}else if(UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Slow walk"])){
					aa_status = "DANGEROUS"
					pred_acc = [255, 50, 50, 255]
				}
				
				if (UI.GetValue(pred_list) & (1  << 3) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, "DT", dt_color, font)
				}
				
				if (UI.GetValue(pred_list) & (1 << 4) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, "OS-AA", hs_color, font)
				}
				
				if (UI.GetValue(pred_list) & (1 << 5) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, "BAIM", baim_color, font)
				}
				
				if (UI.GetValue(pred_list) & (1 << 6) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, "SAFE", sp_color, font)
				}
				
				if (UI.GetValue(pred_list) & (1 << 7) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, "QUICK PEEK", autopeek_color, font)
				}
				
				if (UI.GetValue(pred_list) & (1 << 8) ) {
					separator = separator + 8
					render_outline_string(x, y + 25 + separator, 1, "FREESTANDING", fs_color, font)
				}
			}
			
			// IDEAL YAW INDICATORS
			if (UI.GetValue(ind_type) == 2) {
				// script name 
				
				if (dsy_final>= 10) {
					Render.String(x + 50, y - 12, 1, ">", [255, 90, 60, 255], font_iy_arrows)
					Render.String(x - 50, y - 12, 1, "<", [255, 255, 255, 255], font_iy_arrows)
				}else{
					Render.String(x - 50, y - 12, 1, "<", [255, 90, 60, 255], font_iy_arrows)
					Render.String(x + 50, y - 12, 1, ">", [255, 255, 255, 255], font_iy_arrows)
				}
				
				Render.String(x, y + 30, 0, "IDEAL YAW", [220, 90, 60, 255], font_iy)
				Render.String(x, y + 40, 0, "DYNAMIC", [180, 160, 255, 255], font_iy)
				
				if(Exploit.GetCharge() == 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					separator = separator + 8
					Render.String(x, y + 42 + separator, 0, "DT", [0, 255, 0, 255], font_iy)
					
				}else if (Exploit.GetCharge() < 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					separator = separator + 8
					Render.String(x, y + 42 + separator, 0, "DT", [255, 0, 0, 255], font_iy)
				}
				
				if (UI.GetValue(["Rage", "Exploits", "Keys", "Key assignment", "Hide shots"])) {
					separator = separator + 8
					Render.String(x, y + 43.5 + separator, 0, "AA", [180, 160, 255, 255], font_iy)
				}
			}
			
			//KILLAURA INDICATORS
			if (UI.GetValue(ind_type) == 3) {
				
				
				//Render.Polygon( [ [x - 53, y - 8], [x - 53, y + 8], [x - 71, y] ], killaura_acc)
				//Render.Polygon( [ [x + 71, y], [x + 53, y + 8], [x + 53, y - 8] ], killaura_acc)
				
				Render.String(x - 50, y - 10, 1, "Q", killaura_acc, custom_arrows)
				Render.String(x + 50, y - 10, 1, "R", killaura_acc, custom_arrows)

				render_outline_string(x - 18, y + 30, 1, "KILLAURA", killaura_title, font_ka)
				separator = separator + 8
				if (flags == 256)
				{
					render_outline_string(x - 36, y + 30 + separator, 1, "AA:FLYING JESUS", killaura_acc, font_ka)	
				}
				else if (Entity.GetProp(yop, "CCSPlayer", "m_flDuckAmount") > 0.8 )
				{
					
					render_outline_string(x - 27, y + 30 + separator, 1, "AA:CROUCHING", killaura_acc, font_ka)
				}
				else if(UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Slow walk"]))
				{	
					render_outline_string(x - 28, y + 30 + separator, 1, "AA:DANGEROUS", killaura_acc, font_ka)
				}
				else
				{
					render_outline_string(x - 20, y + 30 + separator, 1, "AA:STABLE", killaura_acc, font_ka)
				}
				
				if(Exploit.GetCharge() == 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					separator = separator + 8
					render_outline_string(x - 22, y + 30 + separator, 1, "DT:NERVOUS", killaura_acc, font_ka)
					
				}else if (Exploit.GetCharge() < 1 && UI.GetValue(["Rage", "Exploits", "Keys", "Double tap"])){
					separator = separator + 8
					render_outline_string(x - 24, y + 30 + separator, 1, "DT:SHIFTING", killaura_acc, font_ka)
				}
				separator = separator + 8
				render_outline_string(x - 10, y + 30 + separator, 1, "FL:"+ Globals.ChokedCommands() , killaura_acc, font_ka)
				
			}
			
			//INVICTUS INDICATORS
			
			if (UI.GetValue(ind_type) == 4){
				
				Render.String(x - 1, y + 41, 1, "Invictus", [0,0,0,155], font_inv);
				Render.String(x, y + 40, 1, "Invictus", inv_color, font_inv);
				
				
				Render.GradientRect( x + -1, y + 35, dsy_final* 1, 2.5, 1, inv_color, inv_color_sec);
				Render.GradientRect( x - -1 - dsy_final* 1, y + 35, dsy_final* 1, 2.5, 1, inv_color_sec, inv_color);
				
				if (dsy_final>= 10) {
					Render.String(x + 6, y + 16, 0, "*", [0,0,0,155], font_inv);
					Render.String(x + 7, y + 15, 0, "*", [255,255,255,255], font_inv);
				} else {
					Render.String(x + 3, y + 16, 0, "*", [0,0,0,155], font_inv);
					Render.String(x + 4, y + 15, 0, "*", [255,255,255,255], font_inv);
				}
				
				Render.String(x - 1, y + 20, 1, dsy_final+ "", [0,0,0,155], font_inv);
				Render.String(x, y + 19, 1, dsy_final+ "", [255,255,255,255], font_inv);
				
				if (dsy_m >= 0) {
					Render.String(x - 53, y - 12, 0, "<", [0,0,0,155], font_inv_arrows );     
					Render.String(x - 53, y - 13, 0, "<", [255,255,255,255], font_inv_arrows );
					Render.String(x + 41, y - 12, 0, ">", [0,0,0,155], font_inv_arrows );  
					Render.String(x + 41, y - 13, 0, ">", inv_color_arrows, font_inv_arrows );
				} else {
					Render.String(x + 41, y - 12, 0, ">", [0,0,0,155], font_inv_arrows );     
					Render.String(x + 41, y - 13, 0, ">", [255,255,255,255], font_inv_arrows );
					Render.String(x - 53, y - 12, 0, "<", [0,0,0,155], font_inv_arrows ); 
					Render.String(x - 53, y - 13, 0, "<", inv_color_arrows, font_inv_arrows );  
				}
			}
		}
	}
}

function menuxd(){
	
	UI.SetEnabled(ind_enb, 1)
	UI.SetEnabled(ind_type, 0)
	UI.SetEnabled(pred_list, 0)
	UI.SetEnabled(color_pred, 0)
	UI.SetEnabled(color_pred_sec, 0)
	UI.SetEnabled(color_ka, 0)
	UI.SetEnabled(color_ka_sec, 0)
	
	if (UI.GetValue(ind_type) == 1 ){
		UI.SetEnabled(pred_list, 1)
		UI.SetEnabled(color_pred, 1)
		UI.SetEnabled(color_pred_sec, 1)
		
	}else{
		UI.SetEnabled(pred_list, 0)
		UI.SetEnabled(color_pred, 0)
		UI.SetEnabled(color_pred_sec, 0)
	}
	
	if (UI.GetValue(ind_type) == 3){
		UI.SetEnabled(color_ka, 1)
		UI.SetEnabled(color_ka_sec, 1)
	}else{
		UI.SetEnabled(color_ka, 0)
		UI.SetEnabled(color_ka_sec, 0)
	}
	
	if (UI.GetValue(ind_type) == 4){
		UI.SetEnabled(color_inv, 1)
		UI.SetEnabled(color_inv_sec, 1)
		UI.SetEnabled(color_inv_arrows, 1)
	}else{
		UI.SetEnabled(color_inv, 0)
		UI.SetEnabled(color_inv_sec, 0)
		UI.SetEnabled(color_inv_arrows, 0)
	}
	
	if (UI.GetValue(ind_enb) == 1){
		UI.SetEnabled(ind_type, 1)
		
	}else if (UI.GetValue(ind_enb) == 0){
		UI.SetEnabled(ind_type, 0)
		UI.SetEnabled(pred_list, 0)
		UI.SetEnabled(color_pred, 0)
		UI.SetEnabled(color_pred_sec, 0)
		UI.SetEnabled(color_ka, 0)
		UI.SetEnabled(color_ka_sec, 0)
		UI.SetEnabled(color_inv, 0)
		UI.SetEnabled(color_inv_sec, 0)
		UI.SetEnabled(color_inv_arrows, 0)
	}
	
}

Cheat.RegisterCallback("Draw", "elpepe");
Cheat.RegisterCallback("Draw", "menuxd");