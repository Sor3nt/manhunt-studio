<?php

use \App\Service\NBinary;

include 'Config.php';

class Api
{
    /** @var Config */
    public $config;

    public function __construct(){
        $this->config = new Config();
    }

    public function detectGameAndPlatformByFolder($folder ){

        if ($folder === false) return false;

        foreach ([ 'mh1' => 'manhunt.exe', 'mh2' => 'Manhunt2.exe', ] as $game => $exe) {
            if (file_exists($folder . '/' . $exe)){
                return [
                    'game' => $game,
                    'platform' => 'pc',
                    'version' => 1.00 //todo
                ];
            }
        }

        if (file_exists($folder . '/SLPS_123.45')){
            return [
                'game' => 'mh1',
                'platform' => 'ps2',
                'version' => 0.64
            ];
        }

        if (file_exists($folder . '/LEVELS/A01_I/A01_I.MLS')){
            return [
                'game' => 'mh2',
                'platform' => 'psp',
                'version' => 0.01
            ];
        }

        if (file_exists($folder . '/LEVELS/A01_ES/A01_ES.MLS')){
            return [
                'game' => 'mh2',
                'platform' => 'psp',
                'version' => 1.00 //todo
            ];
        }

        return false;
    }

    public function getLevelList( $id ){

        $levels = [];
echo "TODO";
        die;
        $game = $this->config->getGame($id);

//        if ($game['game'] == 'mh1') {
//            if ($game['platform'] === 'pc'){
//                $data = file_get_contents($game['path'] . '/initscripts/LEVELS/levels.txt');
//            }else if ($game['platform'] === 'ps2'){
//                $data = file_get_contents($game['path'] . '/GLOBAL/INITSCR/LEVELS.TXT');
//            }
//
//            $data = explode("\n", $data);
//            foreach ($data as $line) {
//                $line = trim($line);
//                $line = str_replace("\t", " ", $line);
//
//                if (substr($line, 0, 5) !== "LEVEL") continue;
//
//                $folderName = trim(substr($line, 6));
//                $folderName = explode(" ", $folderName)[0];
//
//                if (is_dir($game['path'] . '/levels/' . strtolower($folderName)))
//                    $levels[] = [
//                        'icon' => '',
//                        'name' => $folderName,
//                        'folderName' => strtolower($folderName),
//                        'folder' => '/levels/' . strtolower($folderName)
//                    ];
//            }
//
//        }else if ($game['game'] == 'mh2'){
//
//            $data = (new NBinary($data))->binary;
//
//            $index = 0;
//            foreach (explode("\n", $data) as $line){
//                $line = trim($line);
//                if (substr($line, 0, 5) !== "LEVEL") continue;
//
//                $folderName = substr($line, 6);
//                $folderNumber = (int)substr($folderName, 1, 2);
//                $folderId = substr($folderName, 0, 3);
//
//                if (is_dir($game['path'] . '/levels/' . $folderName)){
//
//                    $realName = false;
//                    foreach ($translation as $pair) {
//                        if ($pair['key'] !== "LVL_" . $folderNumber) continue;
//                        $realName = $pair['text'];
//                    }
//
//                    $levels[] = [
//                        'folderName' => $folderName,
//                        'icon' => strtolower($folderId),
//                        'name' => $realName,
//                        'folder' => '/levels/' . strtolower($folderName)
//                    ];
//
//                }
//
//                $index++;
//
//            }
//        }


        return $levels;
    }


    public function readAndSendFile($gameId, $file ){

                $game = $this->config->getGame($gameId);

        if (strpos($file, ".pak#") !== false){
            list($pakFile, $innerFile) = explode("#", $file);
            $pakHandler = new \App\Service\Archive\Pak();
            $pakFiles = $pakHandler->unpack(
                new NBinary(file_get_contents($game['path'] . "/"  . $pakFile)),
                \App\MHT::GAME_MANHUNT,
                \App\MHT::PLATFORM_PC
            );

            foreach ($pakFiles as $fileName => $data) {

                if (strtolower($fileName) == strtolower($innerFile)){
                    $realFile = $data;
                    break;
                }
            }

        }else{
            $realFile = file_get_contents($game['path'] . "/" . $file);

            //just to take sure zlib was applied
//            $realFile = new NBinary($realFile);
//            $realFile = $realFile->binary;
        }

        $this->send($realFile);
    }

    public function sendStatus( $status ){
        $this->send([ 'status' => $status ]);
    }

    public function send($file){

        if (is_array($file))
            $file = \json_encode($file);

        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=data');
        header('Content-Transfer-Encoding: binary');
        header('Connection: Keep-Alive');
        header('Content-Length: ' . \mb_strlen($file, '8bit'));

        echo $file;
        exit;

    }


}