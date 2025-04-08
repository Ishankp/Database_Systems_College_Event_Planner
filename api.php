<?php
header('Content-Type: application/json');

// Include the database connection file.
require_once 'db_connection.php';

// Make sure the request is a POST request.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // 405 Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
    exit;
}

// Retrieve the 'action' parameter from the POST data.
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'registerUser':
        registerUser($pdo);
        break;
    case 'loginUser':
        loginUser($pdo);
        break;
    case 'loadAllEvents':
        loadAllEvents($pdo);
        break;
    case 'loadSpecificEvent':
        loadSpecificEvent($pdo);
        break;
    case 'studentRSOLookup':
        studentRSOLookup($pdo);
        break;
    case 'studentRSOLoad':
        studentRSOLoad($pdo);
        break;
    case 'studentRSOLeave':
        studentRSOLeave($pdo);
        break;
    case 'studentRSOCreate':
        studentRSOCreate($pdo);
        break;
    case 'studentRSOJoin':
        studentRSOJoin($pdo);
        break;
    case 'loadUserRSOs':
        loadUserRSOs($pdo);
        break;
    case 'createRSOEvent':
        createRSOEvent($pdo);
        break;
    case 'createPublicEvent':
        createPublicEvent($pdo);
        break;
    case 'createPrivateEvent':
        createPrivateEvent($pdo);
        break;
    case 'createLocation':
        createLocation($pdo);
        break;
    case 'createComment':
        createComment($pdo);
        break;
    case 'loadEventComments':
        loadEventComments($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        break;
}

// Function to register a new user.
function registerUser($pdo) {
    // Retrieve input parameters from the POST data.
    $uid        = $_POST['uid'] ?? '';
    $university = $_POST['university'] ?? '';
    $email      = $_POST['email'] ?? '';
    $firstname  = $_POST['firstname'] ?? '';
    $lastname   = $_POST['lastname'] ?? '';
    $phone      = $_POST['phone'] ?? '';
    $password   = $_POST['password'] ?? '';

    // Check for required fields.
    if (!$uid || !$email || !$password) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    // Hash the password for security.
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $sql = "INSERT INTO `User` (UID, university, email, firstname, lastname, phone, password) 
                VALUES (:uid, :university, :email, :firstname, :lastname, :phone, :password)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':uid'        => $uid,
            ':university' => $university,
            ':email'      => $email,
            ':firstname'  => $firstname,
            ':lastname'   => $lastname,
            ':phone'      => $phone,
            ':password'   => $hashedPassword,
        ]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

// Function to log in a user.
function loginUser($pdo) {
    // Retrieve input parameters from the POST data.
    $email    = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Check for required fields.
    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    try {
        $sql = "SELECT UID, password FROM `User` WHERE email = :email LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify the password.
        if ($user && password_verify($password, $user['password'])) {
            echo json_encode(["success" => true, "uid" => $user['UID']]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

// Function to load all events
function loadAllEvents($pdo) {
    // Retrieve the UID from the POST data.
    $uid = $_POST['uid'] ?? '';
    if (!$uid) {
        echo json_encode(["success" => false, "message" => "Missing UID"]);
        return;
    }

    try {
        // Retrieve the user's university
        $stmt = $pdo->prepare("SELECT university FROM `User` WHERE UID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            return;
        }
        $userUniversity = $user['university'];

        // Build a UNION query to get:
        // 1. All public events.
        // 2. Private events from the user's university.
        // 3. RSO events based on membership (using JoinRSO).
        $sql = "
            (SELECT e.EventID, e.eventName 
             FROM `Event` e 
             JOIN Public_Event pe ON e.EventID = pe.EventID)
            UNION
            (SELECT e.EventID, e.eventName 
             FROM `Event` e 
             JOIN Private_Event pr ON e.EventID = pr.EventID 
             WHERE e.university = :userUniversity)
            UNION
            (SELECT e.EventID, e.eventName 
             FROM `Event` e
             JOIN RSO_Event re ON e.EventID = re.EventID
             JOIN JoinRSO j ON re.RSOID = j.RSOID 
             WHERE j.UID = :uid)
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':userUniversity' => $userUniversity,
            ':uid'            => $uid,
        ]);
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "events"  => $events
        ]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

// Function to load a specific event
function loadSpecificEvent($pdo) {
    // Retrieve the eventID from the POST data.
    $eventID = $_POST['eventID'] ?? '';
    if (!$eventID) {
        echo json_encode(["success" => false, "message" => "Missing eventID"]);
        return;
    }

    try {
        // Get the event's basic details from the Event table.
        $stmt = $pdo->prepare("SELECT eventName, description, eventTime, location_name, university 
                               FROM `Event` WHERE EventID = :eventID LIMIT 1");
        $stmt->execute([':eventID' => $eventID]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$event) {
            echo json_encode(["success" => false, "message" => "Event not found"]);
            return;
        }

        $eventType = '';
        $rsoName = '';

        // Check if it's an RSO event. If so, get the RSO name.
        $stmt = $pdo->prepare("SELECT r.Name 
                               FROM RSO_Event re 
                               JOIN RSO r ON re.RSOID = r.RSOID 
                               WHERE re.EventID = :eventID LIMIT 1");
        $stmt->execute([':eventID' => $eventID]);
        $rsoResult = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($rsoResult) {
            $eventType = "RSO";
            $rsoName = $rsoResult['Name'];
        } else {
            // Check if it's a private event.
            $stmt = $pdo->prepare("SELECT EventID FROM Private_Event WHERE EventID = :eventID LIMIT 1");
            $stmt->execute([':eventID' => $eventID]);
            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                $eventType = "private";
            } else {
                // Check if it's a public event.
                $stmt = $pdo->prepare("SELECT EventID FROM Public_Event WHERE EventID = :eventID LIMIT 1");
                $stmt->execute([':eventID' => $eventID]);
                if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                    $eventType = "public";
                }
            }
        }

        // Prepare the response.
        $response = [
            "success"      => true,
            "eventName"    => $event['eventName'],
            "description"  => $event['description'],
            "eventTime"    => $event['eventTime'],
            "location_name"=> $event['location_name'],
            "university"   => $event['university'],
            "type"         => $eventType
        ];
        // If it's an RSO event, include the RSO name.
        if ($eventType == "RSO") {
            $response["rsoName"] = $rsoName;
        }
        echo json_encode($response);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Load all RSOs for a specific university
function studentRSOLookup($pdo) {
    $uid = $_POST['uid'] ?? '';
    if (!$uid) {
        echo json_encode(["success" => false, "message" => "UID is required"]);
        return;
    }
    try {
        // Get the user's university from the User table.
        $stmt = $pdo->prepare("SELECT university FROM `User` WHERE UID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            return;
        }
        $university = $user['university'];
        
        // Look up all RSOs in the same university.
        $stmt = $pdo->prepare("SELECT RSOID, Name FROM RSO WHERE University = :university");
        $stmt->execute([':university' => $university]);
        $rsos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "rsos" => $rsos]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Load a specific RSO's information
function studentRSOLoad($pdo) {
    $rsoid = $_POST['rsoid'] ?? '';
    if (!$rsoid) {
        echo json_encode(["success" => false, "message" => "RSOID is required"]);
        return;
    }
    try {
        $stmt = $pdo->prepare("SELECT Name, NumMem, University, RSOID FROM RSO WHERE RSOID = :rsoid LIMIT 1");
        $stmt->execute([':rsoid' => $rsoid]);
        $rso = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$rso) {
            echo json_encode(["success" => false, "message" => "RSO not found"]);
            return;
        }
        echo json_encode(["success" => true, "rso" => $rso]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Leave an RSO
function studentRSOLeave($pdo) {
    $uid = $_POST['uid'] ?? '';
    $rsoid = $_POST['rsoid'] ?? '';
    if (!$uid || !$rsoid) {
        echo json_encode(["success" => false, "message" => "UID and RSOID are required"]);
        return;
    }
    try {
        // Delete the membership record.
        $stmt = $pdo->prepare("DELETE FROM JoinRSO WHERE UID = :uid AND RSOID = :rsoid");
        $stmt->execute([':uid' => $uid, ':rsoid' => $rsoid]);
        
        if ($stmt->rowCount() > 0) {
            // Decrement the number of members in the RSO table.
            $updateSQL = "UPDATE RSO SET NumMem = NumMem - 1 WHERE RSOID = :rsoid";
            $updateStmt = $pdo->prepare($updateSQL);
            $updateStmt->execute([':rsoid' => $rsoid]);
            
            echo json_encode(["success" => true, "message" => "RSO left successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "Record not found or already removed"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}


//Create an RSO
function studentRSOCreate($pdo) {
    $uid   = $_POST['uid'] ?? '';
    $rsoid = $_POST['rsoid'] ?? '';
    $name  = $_POST['name'] ?? '';
    if (!$uid || !$rsoid || !$name) {
        echo json_encode(["success" => false, "message" => "UID, RSOID, and Name are required"]);
        return;
    }
    try {
        // Get the user's university
        $stmt = $pdo->prepare("SELECT university FROM `User` WHERE UID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            return;
        }
        $university = $user['university'];
        
        // Insert into the RSO table.
        $stmt = $pdo->prepare("INSERT INTO RSO (RSOID, Name, NumMem, Approved, University, CreatorID) 
                               VALUES (:rsoid, :name, 1, FALSE, :university, :uid)");
        $stmt->execute([
            ':rsoid' => $rsoid,
            ':name'  => $name,
            ':university' => $university,
            ':uid' => $uid
        ]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Join an RSO
function studentRSOJoin($pdo) {
    $uid   = $_POST['uid'] ?? '';
    $rsoid = $_POST['rsoid'] ?? '';
    if (!$uid || !$rsoid) {
        echo json_encode([
            "success" => false,
            "message" => "UID and RSOID are required."
        ]);
        return;
    }

    try {
        // Check if the user is already a member.
        $checkSQL = "SELECT * FROM JoinRSO WHERE UID = :uid AND RSOID = :rsoid";
        $checkStmt = $pdo->prepare($checkSQL);
        $checkStmt->execute([':uid' => $uid, ':rsoid' => $rsoid]);
        if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode([
                "success" => false,
                "message" => "User is already a member of this RSO."
            ]);
            return;
        }
        
        // Insert the new membership.
        $sql = "INSERT INTO JoinRSO (UID, RSOID) VALUES (:uid, :rsoid)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':uid' => $uid, ':rsoid' => $rsoid]);
        
        // Update the number of members in the RSO table.
        $updateSQL = "UPDATE RSO SET NumMem = NumMem + 1 WHERE RSOID = :rsoid";
        $updateStmt = $pdo->prepare($updateSQL);
        $updateStmt->execute([':rsoid' => $rsoid]);
        
        echo json_encode([
            "success" => true,
            "message" => "RSO joined successfully."
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
}

//Load all RSOs for a specific user
function loadUserRSOs($pdo) {
    $uid = $_POST['uid'] ?? '';
    if (!$uid) {
        echo json_encode(["success" => false, "message" => "UID is required"]);
        return;
    }
    try {
        $sql = "SELECT r.RSOID, r.Name 
                FROM JoinRSO j 
                JOIN RSO r ON j.RSOID = r.RSOID 
                WHERE j.UID = :uid";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':uid' => $uid]);
        $rsos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "rsos" => $rsos]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}


#TODO: Check the following function for correctness in POSTMAN
//Create an RSO event
function createRSOEvent($pdo) {
    $eventID       = $_POST['eventid'] ?? '';
    $eventName     = $_POST['eventname'] ?? '';
    $description   = $_POST['description'] ?? '';
    $eventTime     = $_POST['eventtime'] ?? '';
    $location_name = $_POST['location_name'] ?? '';
    $uid           = $_POST['uid'] ?? '';  // the admin's UID

    if (!$eventID || !$eventName || !$description || !$eventTime || !$location_name || !$uid) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    try {
        // Verify that the user is an Admin.
        $stmt = $pdo->prepare("SELECT * FROM Admin WHERE UserID = :uid");
        $stmt->execute([':uid' => $uid]);
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode(["success" => false, "message" => "User is not an admin"]);
            return;
        }
        
        // Retrieve the user's university.
        $stmt = $pdo->prepare("SELECT university FROM `User` WHERE UID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            return;
        }
        $university = $user['university'];
        
        // Look up the RSO that this admin created.
        $stmt = $pdo->prepare("SELECT RSOID FROM RSO WHERE CreatorID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $rso = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$rso) {
            echo json_encode(["success" => false, "message" => "No RSO associated with this admin"]);
            return;
        }
        $rsoid = $rso['RSOID'];
        
        // Insert into the Event table.
        $sql = "INSERT INTO `Event` (EventID, eventName, description, eventTime, location_name, university)
                VALUES (:eventID, :eventName, :description, :eventTime, :location_name, :university)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':eventID'     => $eventID,
            ':eventName'   => $eventName,
            ':description' => $description,
            ':eventTime'   => $eventTime,
            ':location_name' => $location_name,
            ':university'  => $university
        ]);
        
        // Insert into the RSO_Event table.
        $sql2 = "INSERT INTO RSO_Event (EventID, RSOID)
                 VALUES (:eventID, :rsoid)";
        $stmt = $pdo->prepare($sql2);
        $stmt->execute([
            ':eventID' => $eventID,
            ':rsoid'   => $rsoid
        ]);
        
        echo json_encode(["success" => true, "message" => "RSO event created successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Create a public event
function createPublicEvent($pdo) {
    $eventID       = $_POST['eventid'] ?? '';
    $eventName     = $_POST['eventname'] ?? '';
    $description   = $_POST['description'] ?? '';
    $eventTime     = $_POST['eventtime'] ?? '';
    $location_name = $_POST['location_name'] ?? '';
    $uid           = $_POST['uid'] ?? '';  // UID of the creator (can be any user)

    if (!$eventID || !$eventName || !$description || !$eventTime || !$location_name || !$uid) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    try {
        // Retrieve the user's university.
        $stmt = $pdo->prepare("SELECT university FROM `User` WHERE UID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            return;
        }
        $university = $user['university'];
        
        // Determine AdminID: if the creator is an admin, use UID; otherwise find an admin in the same university.
        $stmt = $pdo->prepare("SELECT UserID FROM Admin WHERE UserID = :uid");
        $stmt->execute([':uid' => $uid]);
        $adminResult = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($adminResult) {
            $adminID = $uid;
        } else {
            $stmt = $pdo->prepare("SELECT a.UserID
                                   FROM Admin a 
                                   JOIN `User` u ON a.UserID = u.UID 
                                   WHERE u.university = :university LIMIT 1");
            $stmt->execute([':university' => $university]);
            $adminResult = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($adminResult) {
                $adminID = $adminResult['UserID'];
            } else {
                echo json_encode(["success" => false, "message" => "No admin available for this university"]);
                return;
            }
        }
        
        // Determine SuperAdminID: if the creator is a superadmin, use UID; otherwise find one in the same university.
        $stmt = $pdo->prepare("SELECT UserID FROM SuperAdmin WHERE UserID = :uid");
        $stmt->execute([':uid' => $uid]);
        $superAdminResult = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($superAdminResult) {
            $superAdminID = $uid;
        } else {
            $stmt = $pdo->prepare("SELECT s.UserID
                                   FROM SuperAdmin s
                                   JOIN `User` u ON s.UserID = u.UID
                                   WHERE u.university = :university LIMIT 1");
            $stmt->execute([':university' => $university]);
            $superAdminResult = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($superAdminResult) {
                $superAdminID = $superAdminResult['UserID'];
            } else {
                echo json_encode(["success" => false, "message" => "No SuperAdmin available for this university"]);
                return;
            }
        }
        
        // Insert into the Event table.
        $sql = "INSERT INTO `Event` (EventID, eventName, description, eventTime, location_name, university)
                VALUES (:eventID, :eventName, :description, :eventTime, :location_name, :university)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':eventID'     => $eventID,
            ':eventName'   => $eventName,
            ':description' => $description,
            ':eventTime'   => $eventTime,
            ':location_name' => $location_name,
            ':university'  => $university,
        ]);
        
        // Insert into the Public_Event table (default Approved is false).
        $sql2 = "INSERT INTO Public_Event (EventID, Approved, AdminID, SuperAdminID)
                 VALUES (:eventID, FALSE, :adminID, :superAdminID)";
        $stmt = $pdo->prepare($sql2);
        $stmt->execute([
            ':eventID'      => $eventID,
            ':adminID'      => $adminID,
            ':superAdminID' => $superAdminID,
        ]);
        
        echo json_encode(["success" => true, "message" => "Public event created successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Create a private event
function createPrivateEvent($pdo) {
    $eventID       = $_POST['eventid'] ?? '';
    $eventName     = $_POST['eventname'] ?? '';
    $description   = $_POST['description'] ?? '';
    $eventTime     = $_POST['eventtime'] ?? '';
    $location_name = $_POST['location_name'] ?? '';
    $uid           = $_POST['uid'] ?? '';  // the SuperAdmin's UID

    if (!$eventID || !$eventName || !$description || !$eventTime || !$location_name || !$uid) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    try {
        // Verify that the user is a SuperAdmin.
        $stmt = $pdo->prepare("SELECT * FROM SuperAdmin WHERE UserID = :uid");
        $stmt->execute([':uid' => $uid]);
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode(["success" => false, "message" => "User is not a SuperAdmin"]);
            return;
        }
        
        // Retrieve the user's university.
        $stmt = $pdo->prepare("SELECT university FROM `User` WHERE UID = :uid LIMIT 1");
        $stmt->execute([':uid' => $uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            return;
        }
        $university = $user['university'];
        
        // Insert into the Event table.
        $sql = "INSERT INTO `Event` (EventID, eventName, description, eventTime, location_name, university)
                VALUES (:eventID, :eventName, :description, :eventTime, :location_name, :university)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':eventID'     => $eventID,
            ':eventName'   => $eventName,
            ':description' => $description,
            ':eventTime'   => $eventTime,
            ':location_name' => $location_name,
            ':university'  => $university,
        ]);
        
        // Insert into the Private_Event table using UID as the SuperAdminID.
        $sql2 = "INSERT INTO Private_Event (EventID, SuperAdminID)
                 VALUES (:eventID, :uid)";
        $stmt = $pdo->prepare($sql2);
        $stmt->execute([
            ':eventID' => $eventID,
            ':uid' => $uid,
        ]);
        
        echo json_encode(["success" => true, "message" => "Private event created successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Create a location
function createLocation($pdo) {
    $university = $_POST['university'] ?? '';
    $name       = $_POST['name'] ?? '';
    $address    = $_POST['address'] ?? '';
    $latitude   = $_POST['latitude'] ?? '';
    $longitude  = $_POST['longitude'] ?? '';
    
    if (!$university || !$name || !$address || !$latitude || !$longitude) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    try {
        $sql = "INSERT INTO Location (university, name, address, latitude, longitude)
                VALUES (:university, :name, :address, :latitude, :longitude)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':university' => $university,
            ':name'       => $name,
            ':address'    => $address,
            ':latitude'   => $latitude,
            ':longitude'  => $longitude,
        ]);
        echo json_encode(["success" => true, "message" => "Location created successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

//Create a comment
function createComment($pdo) {
    // Retrieve input parameters from POST data
    $uid     = $_POST['uid'] ?? '';
    $eventid = $_POST['eventid'] ?? '';
    $text    = $_POST['text'] ?? '';
    $rating  = $_POST['rating'] ?? '';

    // Check if all required fields are provided.
    if (!$uid || !$eventid || $text === '' || $rating === '') {
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields: uid, eventid, text, and rating are required."
        ]);
        return;
    }

    try {
        // Insert the comment into the Comment table.
        $sql = "INSERT INTO Comment (EventID, UID, text, rating, timestamp)
                VALUES (:eventid, :uid, :text, :rating, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':eventid' => $eventid,
            ':uid'     => $uid,
            ':text'    => $text,
            ':rating'  => $rating
        ]);
        
        echo json_encode([
            "success" => true,
            "message" => "Comment created successfully."
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
}

//Load all comments for a specific event
function loadEventComments($pdo) {
    $eventid = $_POST['eventid'] ?? '';

    // Validate the input.
    if (!$eventid) {
        echo json_encode([
            "success" => false,
            "message" => "EventID is required."
        ]);
        return;
    }

    try {
        // Retrieve all comments for the given event.
        $sql = "SELECT UID, text, rating, timestamp 
                FROM Comment 
                WHERE EventID = :eventid 
                ORDER BY timestamp ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':eventid' => $eventid]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "comments" => $comments
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
}

?>
