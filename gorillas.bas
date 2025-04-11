
' QBasic Gorillas - Mainzorro Edition
' Jogo original da IBM/Microsoft adaptado para o navegador

DEFINT A-Z

DECLARE SUB DoSun (Mouth)
DECLARE SUB SetScreen ()
DECLARE SUB EndGame ()
DECLARE SUB Center (Row, Text$)
DECLARE SUB Intro ()
DECLARE SUB SparklePause ()
DECLARE SUB GetInputs (Player1$, Player2$, NumGames)
DECLARE SUB PlayGame (Player1$, Player2$, NumGames)
DECLARE SUB DoExplosion (x#, y#)
DECLARE SUB MakeCityScape (BCoor() AS ANY)
DECLARE SUB PlaceGorillas (BCoor() AS ANY)
DECLARE SUB UpdateScores (Record(), PlayerNum, Results)
DECLARE SUB DrawGorilla (x, y, arms)
DECLARE SUB GorillaIntro (Player1$, Player2$)
DECLARE SUB Rest (t#)
DECLARE SUB VictoryDance (Player)
DECLARE SUB ClearGorillas ()
DECLARE SUB DrawBan (xc#, yc#, r, bc)
DECLARE FUNCTION Scl (n!)
DECLARE FUNCTION GetNum# (Row, Col)
DECLARE FUNCTION DoShot (PlayerNum, x, y)
DECLARE FUNCTION ExplodeGorilla (x#, y#)
DECLARE FUNCTION Getn# (Row, Col)
DECLARE FUNCTION PlotShot (StartX, StartY, Angle#, Velocity, PlayerNum)
DECLARE FUNCTION CalcDelay! ()

' Setup do jogo
DEF FnRan (x) = INT(RND(1) * x) + 1
DEF SEG = 0

' Configuração inicial
GOSUB InitVars
Intro

' Loop principal
spam:
  GetInputs Name1$, Name2$, NumGames
  GorillaIntro Name1$, Name2$
  PlayGame Name1$, Name2$, NumGames

LOCATE 11, 24
COLOR 5
PRINT "Would you like to play again?"
COLOR 7
a = 1
DO
  again$ = INKEY$
LOOP UNTIL (again$ = "y") OR (again$ = "n")
CLS
IF again$ = "y" THEN GOTO spam

' Variáveis
CGABanana:
  ' Dados do gráfico da banana (dividido em 4 partes)
  DATA 327686, -252645316, 60
  DATA 196618, -1057030081, 49344
  DATA 196618, -1056980800, 63
  DATA 327686,  1010580720, 240

' Funções e Sub-rotinas
InitVars:
  pi# = 4 * ATN(1#)

  ' Selecionar o melhor modo gráfico disponível
  ON ERROR GOTO ScreenModeError
  Mode = 9
  SCREEN Mode
  ON ERROR GOTO PaletteError
  IF Mode = 9 THEN PALETTE 4, 0   ' Verificar para EGA
  ON ERROR GOTO 0

  MachSpeed = CalcDelay

  IF Mode = 9 THEN
    ScrWidth = 640
    ScrHeight = 350
    GHeight = 25
    RESTORE EGABanana
    REDIM LBan&(8), RBan&(8), UBan&(8), DBan&(8)

    FOR i = 0 TO 8
      READ LBan&(i)
    NEXT i

    FOR i = 0 TO 8
      READ DBan&(i)
    NEXT i

    FOR i = 0 TO 8
      READ UBan&(i)
    NEXT i

    FOR i = 0 TO 8
      READ RBan&(i)
    NEXT i

    SunHt = 39
  ELSE
    ScrWidth = 320
    ScrHeight = 200
    GHeight = 12
    RESTORE CGABanana
    REDIM LBan&(2), RBan&(2), UBan&(2), DBan&(2)
    REDIM GorL&(20), GorD&(20), GorR&(20)

    FOR i = 0 TO 2
      READ LBan&(i)
    NEXT i
    FOR i = 0 TO 2
      READ DBan&(i)
    NEXT i
    FOR i = 0 TO 2
      READ UBan&(i)
    NEXT i
    FOR i = 0 TO 2
      READ RBan&(i)
    NEXT i

    MachSpeed = MachSpeed * 1.3
    SunHt = 20
  END IF
RETURN

' Código de animação, inputs e o resto do jogo...

