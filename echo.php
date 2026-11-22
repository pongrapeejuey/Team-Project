<?php
header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . '/portfolio.json';
function validatePortfolio($p) {
    $required = [
        'id',
        'displayName',
        'whatIEnjoy',
        'whatIveTried',
        'whatImCuriousAbout',
        'items'
    ];

    foreach ($required as $field) {
        if (!array_key_exists($field, $p)) {
            return false;
        }
    }

    if (!is_string($p['id']) || trim($p['id']) === '') {
        return false;
    }

    if (!is_string($p['displayName']) || trim($p['displayName']) === '') {
        return false;
    }

    if (!is_array($p['items'])) {
        return false;
    }

    return true;
}

function validateItem($item) {
    $required = [
        'id',
        'title',
        'type',
        'date',
        'role',
        'description',
        'skills',
        'reflection',
        'evidence'
    ];

    foreach ($required as $field) {
        if (!array_key_exists($field, $item)) {
            return false;
        }
    }

    if (!is_string($item['id']) || trim($item['id']) === '') {
        return false;
    }

    if (!is_array($item['skills']) || count($item['skills']) === 0) {
    return false;
}

foreach ($item['skills'] as $skill) {
    if (!is_string($skill) || trim($skill) === '') {
        return false;
    }
}

    $reflectionFields = [
    'whatIDid',
    'whatILearned',
    'challenge',
    'nextStep'
];

if (!is_array($item['reflection'])) {
    return false;
}

foreach ($reflectionFields as $field) {
    if (
        !isset($item['reflection'][$field]) ||
        !is_string($item['reflection'][$field]) ||
        trim($item['reflection'][$field]) === ''
    ) {
        return false;
    }
}

    if (!is_array($item['evidence']) || count($item['evidence']) === 0) {
    return false;
}

foreach ($item['evidence'] as $url) {
    if (
        !is_string($url) ||
        !filter_var($url, FILTER_VALIDATE_URL) ||
        !in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'])
    ) {
        return false;
    }
}

    return true;
}

if (!file_exists($file)) {
    file_put_contents($file, '[]');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo file_get_contents($file);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
        exit;
    }

    foreach ($data as $entry) {
        if (!is_array($entry)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Invalid entry']);
            exit;
        }

        $isStandaloneItem = !(isset($entry['items']) && is_array($entry['items']))
            && isset($entry['title']) && is_string($entry['title']);

        if ($isStandaloneItem) {
            if (!validateItem($entry)) {
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'Invalid item']);
                exit;
            }
            continue;
        }

        if (!validatePortfolio($entry)) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'error' => 'Invalid portfolio data'
            ]);
            exit;
        }

        foreach ($entry['items'] as $item) {
            if (!is_array($item) || !validateItem($item)) {
                http_response_code(400);
                echo json_encode([
                    'ok' => false,
                    'error' => 'Invalid portfolio item'
                ]);
                exit;
            }
        }
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    if (file_put_contents($file, $json, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Cannot write file']);
        exit;
    }

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);