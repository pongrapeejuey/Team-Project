<?php
header("Content-Type: application/json; charset=utf-8");

$input = json_decode(file_get_contents("php://input"), true);
$data = $input["image"] ?? "";

if (!preg_match('#^data:image/(jpeg|png|webp);base64,(.+)$#', $data, $m)) {
    http_response_code(400);
    echo json_encode(["error" => "invalid image"]);
    exit;
}

$bin = base64_decode($m[2], true);
if ($bin === false) {
    http_response_code(400);
    echo json_encode(["error" => "invalid base64"]);
    exit;
}

$ext = $m[1] === "jpeg" ? "jpg" : $m[1];
$dir = __DIR__ . "/uploads";
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$name = hash("sha256", $bin) . "." . $ext;
file_put_contents($dir . "/" . $name, $bin);

$scheme = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") ? "https" : "http";
$base = rtrim(dirname($_SERVER["SCRIPT_NAME"]), "/\\");

echo json_encode(["url" => $scheme . "://" . $_SERVER["HTTP_HOST"] . $base . "/uploads/" . $name]);