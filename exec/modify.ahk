Run niub.exe
Sleep, 5000 
if WinExist("ahk_exe niub.exe"){
    
    id := WinExist("ahk_exe niub.exe")
    ControlClick, x171 y487 , ahk_id %id%;
    Sleep, 20000 
    Send {Space}
    Sleep, 5000 
    ControlClick, X482 Y494 , ahk_id %id%;
}  
else{
    MsgBox something wrong,cannot find niub
}
