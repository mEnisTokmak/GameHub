-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Anamakine: localhost
-- Üretim Zamanı: 27 Ara 2025, 12:25:37
-- Sunucu sürümü: 8.0.44
-- PHP Sürümü: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `gamehub`
--

DELIMITER $$
--
-- Yordamlar
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `DepositBalance` (IN `p_UserID` INT, IN `p_Amount` DECIMAL(10,2))   BEGIN
    UPDATE Users SET Balance = Balance + p_Amount WHERE UserID = p_UserID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetBestSellingGames` ()   BEGIN
    SELECT g.Title, COUNT(l.RecordID) as TotalSales
    FROM Games g
    LEFT JOIN Library l ON g.GameID = l.GameID
    GROUP BY g.GameID
    ORDER BY TotalSales DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetDetailedOrderHistory` (IN `p_UserID` INT)   BEGIN
    SELECT o.OrderDate, g.Title, od.UnitPrice, pm.MethodName
    FROM Orders o
    JOIN OrderDetails od ON o.OrderID = od.OrderID
    JOIN Games g ON od.GameID = g.GameID
    JOIN PaymentMethods pm ON o.MethodID = pm.MethodID
    WHERE o.UserID = p_UserID
    ORDER BY o.OrderDate DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetFriendsSharedGames` (IN `p_UserID` INT)   BEGIN
    SELECT DISTINCT g.Title, u_friend.Username as OwnedByFriend
    FROM Friends f
    JOIN Users u_friend ON (f.User2_ID = u_friend.UserID OR f.User1_ID = u_friend.UserID)
    JOIN Library l ON u_friend.UserID = l.UserID
    JOIN Games g ON l.GameID = g.GameID
    WHERE (f.User1_ID = p_UserID OR f.User2_ID = p_UserID) 
      AND u_friend.UserID != p_UserID 
      AND f.Status = 'Accepted';
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetGameRatingStats` (IN `p_GameID` INT)   BEGIN
    SELECT g.Title, IFNULL(AVG(r.Rating), 0) as AvgRating, COUNT(r.ReviewID) as ReviewCount
    FROM Games g
    LEFT JOIN Reviews r ON g.GameID = r.GameID
    WHERE g.GameID = p_GameID
    GROUP BY g.GameID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetGamesByPriceRange` (IN `p_Min` DECIMAL(10,2), IN `p_Max` DECIMAL(10,2))   BEGIN
    SELECT Title, Price, SizeGB FROM Games 
    WHERE Price BETWEEN p_Min AND p_Max 
    ORDER BY Price ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetGameTagsAndCategories` (IN `p_GameID` INT)   BEGIN
    SELECT g.Title, 
           (SELECT GROUP_CONCAT(TagName) FROM Tags t JOIN Game_Tag gt ON t.TagID = gt.TagID WHERE gt.GameID = g.GameID) as AllTags,
           (SELECT GROUP_CONCAT(CategoryName) FROM Categories c JOIN Game_Category gc ON c.CategoryID = gc.CategoryID WHERE gc.GameID = g.GameID) as AllCategories
    FROM Games g
    WHERE g.GameID = p_GameID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetGameTechnicalDetails` (IN `p_GameID` INT)   BEGIN
    SELECT g.Title, d.CompanyName, sr.OS, sr.Processor, sr.GraphicsCard, sr.MemoryGB
    FROM Games g
    JOIN Developers d ON g.DeveloperID = d.DeveloperID
    JOIN SystemRequirements sr ON g.GameID = sr.GameID
    WHERE g.GameID = p_GameID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetLockedAchievements` (IN `p_UserID` INT, IN `p_GameID` INT)   BEGIN
    SELECT a.Title, a.Description, a.PointValue
    FROM Achievements a
    WHERE a.GameID = p_GameID 
      AND a.AchievementID NOT IN (
          SELECT AchievementID FROM UserAchievements WHERE UserID = p_UserID
      );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetModernDevsGames` (IN `p_Year` INT)   BEGIN
    SELECT d.CompanyName, g.Title, g.ReleaseDate
    FROM Developers d
    JOIN Games g ON d.DeveloperID = g.DeveloperID
    WHERE d.FoundationYear >= p_Year;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetPendingFriendRequests` (IN `p_UserID` INT)   BEGIN
    SELECT u.Username, f.FriendDate
    FROM Friends f
    JOIN Users u ON f.User1_ID = u.UserID
    WHERE f.User2_ID = p_UserID AND f.Status = 'Pending';
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetRevenueByCategory` ()   BEGIN
    SELECT c.CategoryName, COUNT(od.DetailID) as SalesCount, SUM(od.UnitPrice) as TotalRevenue
    FROM Categories c
    JOIN Game_Category gc ON c.CategoryID = gc.CategoryID
    JOIN OrderDetails od ON gc.GameID = od.GameID
    GROUP BY c.CategoryID
    ORDER BY TotalRevenue DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetStoreFrontByDeveloper` (IN `p_DevName` VARCHAR(100))   BEGIN
    SELECT g.Title, g.Price, d.CompanyName, GROUP_CONCAT(c.CategoryName) as Categories
    FROM Games g
    JOIN Developers d ON g.DeveloperID = d.DeveloperID
    JOIN Game_Category gc ON g.GameID = gc.GameID
    JOIN Categories c ON gc.CategoryID = c.CategoryID
    WHERE d.CompanyName LIKE CONCAT('%', p_DevName, '%')
    GROUP BY g.GameID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetTopAchievementHunters` ()   BEGIN
    SELECT u.Username, COUNT(ua.UnlockID) as AchievementsUnlocked, SUM(a.PointValue) as TotalPoints
    FROM Users u
    JOIN UserAchievements ua ON u.UserID = ua.UserID
    JOIN Achievements a ON ua.AchievementID = a.AchievementID
    GROUP BY u.UserID
    ORDER BY TotalPoints DESC
    LIMIT 10;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserProfileSummary` (IN `p_UserID` INT)   BEGIN
    SELECT u.Username, r.RoleName, 
           (SELECT COUNT(*) FROM Library WHERE UserID = u.UserID) as TotalGames,
           IFNULL(SUM(a.PointValue), 0) as TotalAchievementPoints
    FROM Users u
    JOIN Roles r ON u.RoleID = r.RoleID
    LEFT JOIN UserAchievements ua ON u.UserID = ua.UserID
    LEFT JOIN Achievements a ON ua.AchievementID = a.AchievementID
    WHERE u.UserID = p_UserID
    GROUP BY u.UserID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetWishlistTotalValue` (IN `p_UserID` INT)   BEGIN
    SELECT u.Username, COUNT(w.WishlistID) as GameCount, SUM(g.Price) as TotalCost
    FROM Wishlist w
    JOIN Games g ON w.GameID = g.GameID
    JOIN Users u ON w.UserID = u.UserID
    WHERE w.UserID = p_UserID;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `QuickAddDeveloperAndGame` (IN `p_CompName` VARCHAR(100), IN `p_GameTitle` VARCHAR(150), IN `p_Price` DECIMAL(10,2))   BEGIN
    INSERT INTO Developers (CompanyName) VALUES (p_CompName);
    INSERT INTO Games (DeveloperID, Title, Price) VALUES (LAST_INSERT_ID(), p_GameTitle, p_Price);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `achievements`
--

CREATE TABLE `achievements` (
  `AchievementID` int NOT NULL,
  `GameID` int NOT NULL,
  `Title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PointValue` int DEFAULT '10'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `achievements`
--

INSERT INTO `achievements` (`AchievementID`, `GameID`, `Title`, `Description`, `PointValue`) VALUES
(1, 2, 'First Blood', 'First kill.', 10),
(2, 2, 'Sharpshooter', '100 kills with AWP.', 10),
(3, 5, 'Welcome', 'First boss.', 10),
(4, 5, 'Elden Lord', 'Finish the game.', 10),
(5, 10, 'Dream', 'Open the map.', 10),
(6, 3, 'Rich', 'Earn 1 Million.', 10),
(7, 4, 'Monster Hunter', 'Complete contract.', 10),
(8, 7, 'Champion', 'League champion.', 10),
(9, 9, 'Savior', 'Save Ashley.', 10),
(10, 8, 'Explorer', 'Discover planets.', 10);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `categories`
--

CREATE TABLE `categories` (
  `CategoryID` int NOT NULL,
  `CategoryName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `categories`
--

INSERT INTO `categories` (`CategoryID`, `CategoryName`, `Description`) VALUES
(1, 'Action', NULL),
(2, 'RPG', NULL),
(3, 'Strategy', NULL),
(4, 'Simulation', NULL),
(5, 'Sports', NULL),
(6, 'Racing', NULL),
(7, 'Adventure', NULL),
(8, 'Horror', NULL),
(9, 'Puzzle', NULL),
(10, 'MMORPG', NULL);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `developers`
--

CREATE TABLE `developers` (
  `DeveloperID` int NOT NULL,
  `CompanyName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Website` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FoundationYear` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `developers`
--

INSERT INTO `developers` (`DeveloperID`, `CompanyName`, `Website`, `FoundationYear`) VALUES
(1, 'Valve', 'valvesoftware.com', 1996),
(2, 'Ubisoft', 'ubisoft.com', 1986),
(3, 'Rockstar Games', 'rockstargames.com', 1998),
(4, 'CD Projekt Red', 'cdprojekt.com', 2002),
(5, 'Electronic Arts', 'ea.com', 1982),
(6, 'Bethesda', 'bethesda.net', 1986),
(7, 'Capcom', 'capcom.com', 1979),
(8, 'FromSoftware', 'fromsoftware.jp', 1986),
(9, 'Naughty Dog', 'naughtydog.com', 1984),
(10, 'Indie Studio', 'indiestudio.io', 2023),
(11, 'deneme1', '', 2025),
(12, 'deneme2', '', 2025);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `friends`
--

CREATE TABLE `friends` (
  `FriendshipID` int NOT NULL,
  `User1_ID` int NOT NULL,
  `User2_ID` int NOT NULL,
  `Status` enum('Pending','Accepted','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `FriendDate` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `friends`
--

INSERT INTO `friends` (`FriendshipID`, `User1_ID`, `User2_ID`, `Status`, `FriendDate`) VALUES
(1, 2, 3, 'Accepted', '2025-12-26 10:52:34'),
(2, 2, 5, 'Accepted', '2025-12-26 10:52:34'),
(3, 3, 5, 'Pending', '2025-12-26 10:52:34'),
(4, 5, 6, 'Accepted', '2025-12-26 10:52:34'),
(5, 6, 4, 'Rejected', '2025-12-26 10:52:34'),
(6, 4, 9, 'Accepted', '2025-12-26 10:52:34'),
(7, 9, 2, 'Pending', '2025-12-26 10:52:34'),
(8, 3, 6, 'Accepted', '2025-12-26 10:52:34'),
(9, 5, 9, 'Accepted', '2025-12-26 10:52:34'),
(10, 2, 6, 'Rejected', '2025-12-26 10:52:34'),
(11, 11, 12, 'Accepted', '2025-12-27 01:20:54');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `games`
--

CREATE TABLE `games` (
  `GameID` int NOT NULL,
  `DeveloperID` int NOT NULL,
  `Title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `Price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ReleaseDate` date DEFAULT NULL,
  `SizeGB` decimal(5,2) DEFAULT NULL,
  `IsApproved` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `games`
--

INSERT INTO `games` (`GameID`, `DeveloperID`, `Title`, `Description`, `Price`, `ReleaseDate`, `SizeGB`, `IsApproved`) VALUES
(1, 1, 'Half-Life 3', 'The legend returns.', 999.99, '2025-12-31', 60.50, 1),
(2, 1, 'Counter-Strike 2', 'Tactical FPS.', 0.00, '2023-09-27', 30.00, 1),
(3, 3, 'GTA VI', 'Expected open world game.', 1500.00, '2025-05-15', 150.00, 1),
(4, 4, 'The Witcher 4', 'A new saga begins.', 1200.00, '2026-01-01', 85.00, 1),
(5, 8, 'Elden Ring', 'Challenging RPG experience.', 899.00, '2022-02-25', 50.00, 1),
(6, 2, 'Assassins Creed Mirage', 'Return to roots.', 900.00, '2023-10-05', 40.00, 1),
(7, 5, 'FIFA 25', 'Football simulation.', 1100.00, '2024-09-28', 55.00, 1),
(8, 6, 'Starfield', 'RPG set in space.', 1000.00, '2023-09-06', 125.00, 1),
(9, 7, 'Resident Evil 4', 'Horror classic.', 850.00, '2023-03-24', 60.00, 1),
(10, 10, 'Hollow Knight', 'Metroidvania style indie.', 150.00, '2017-02-24', 9.00, 1);

--
-- Tetikleyiciler `games`
--
DELIMITER $$
CREATE TRIGGER `trg_LogPriceChanges` AFTER UPDATE ON `games` FOR EACH ROW BEGIN
    IF OLD.Price <> NEW.Price THEN
        INSERT INTO PriceChangeLogs (GameID, OldPrice, NewPrice)
        VALUES (OLD.GameID, OLD.Price, NEW.Price);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `game_category`
--

CREATE TABLE `game_category` (
  `GameID` int NOT NULL,
  `CategoryID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `game_category`
--

INSERT INTO `game_category` (`GameID`, `CategoryID`) VALUES
(1, 1),
(2, 1),
(3, 1),
(6, 1),
(10, 1),
(4, 2),
(5, 2),
(8, 2),
(7, 5),
(1, 7),
(3, 7),
(9, 8),
(10, 9);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `game_tag`
--

CREATE TABLE `game_tag` (
  `GameID` int NOT NULL,
  `TagID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `game_tag`
--

INSERT INTO `game_tag` (`GameID`, `TagID`) VALUES
(2, 1),
(7, 1),
(1, 2),
(3, 2),
(4, 2),
(5, 2),
(9, 2),
(3, 4),
(5, 6),
(8, 7),
(2, 9),
(10, 10);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `library`
--

CREATE TABLE `library` (
  `RecordID` int NOT NULL,
  `UserID` int NOT NULL,
  `GameID` int NOT NULL,
  `PurchaseDate` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `library`
--

INSERT INTO `library` (`RecordID`, `UserID`, `GameID`, `PurchaseDate`) VALUES
(1, 2, 10, '2025-12-26 10:52:34'),
(2, 3, 3, '2025-12-26 10:52:34'),
(3, 3, 4, '2025-12-26 10:52:34'),
(4, 4, 2, '2025-12-26 10:52:34'),
(5, 5, 5, '2025-12-26 10:52:34'),
(6, 6, 7, '2025-12-26 10:52:34'),
(7, 2, 6, '2025-12-26 10:52:34'),
(8, 9, 10, '2025-12-26 10:52:34'),
(9, 6, 2, '2025-12-26 10:52:34'),
(10, 5, 9, '2025-12-26 10:52:34'),
(11, 11, 7, '2025-12-26 23:20:49'),
(12, 11, 8, '2025-12-26 23:25:25'),
(14, 11, 6, '2025-12-26 23:44:58'),
(16, 11, 3, '2025-12-26 23:44:58'),
(18, 11, 4, '2025-12-26 23:44:58'),
(20, 11, 10, '2025-12-27 00:02:41');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `orderdetails`
--

CREATE TABLE `orderdetails` (
  `DetailID` int NOT NULL,
  `OrderID` int NOT NULL,
  `GameID` int NOT NULL,
  `UnitPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `orderdetails`
--

INSERT INTO `orderdetails` (`DetailID`, `OrderID`, `GameID`, `UnitPrice`) VALUES
(1, 1, 10, 150.00),
(2, 2, 3, 1500.00),
(3, 2, 4, 1200.00),
(4, 3, 2, 0.00),
(5, 4, 5, 899.00),
(6, 5, 7, 1100.00),
(7, 6, 6, 900.00),
(8, 7, 3, 1500.00),
(9, 8, 10, 150.00),
(10, 10, 9, 850.00),
(11, 11, 7, 1100.00),
(12, 12, 8, 1000.00),
(13, 13, 6, 900.00),
(14, 13, 3, 1500.00),
(15, 13, 4, 1200.00),
(16, 14, 10, 150.00);

--
-- Tetikleyiciler `orderdetails`
--
DELIMITER $$
CREATE TRIGGER `trg_AddGameToLibraryAfterPurchase` AFTER INSERT ON `orderdetails` FOR EACH ROW BEGIN
    DECLARE v_UserID INT;
    SELECT UserID INTO v_UserID FROM Orders WHERE OrderID = NEW.OrderID;
    
    INSERT IGNORE INTO Library (UserID, GameID)
    VALUES (v_UserID, NEW.GameID);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `orders`
--

CREATE TABLE `orders` (
  `OrderID` int NOT NULL,
  `UserID` int NOT NULL,
  `MethodID` int NOT NULL,
  `OrderDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `TotalAmount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `orders`
--

INSERT INTO `orders` (`OrderID`, `UserID`, `MethodID`, `OrderDate`, `TotalAmount`) VALUES
(1, 2, 1, '2025-12-26 10:52:34', 150.00),
(2, 3, 3, '2025-12-26 10:52:34', 2700.00),
(3, 4, 2, '2025-12-26 10:52:34', 0.00),
(4, 5, 1, '2025-12-26 10:52:34', 899.00),
(5, 6, 4, '2025-12-26 10:52:34', 1100.00),
(6, 2, 3, '2025-12-26 10:52:34', 900.00),
(7, 3, 1, '2025-12-26 10:52:34', 1500.00),
(8, 9, 5, '2025-12-26 10:52:34', 150.00),
(9, 6, 2, '2025-12-26 10:52:34', 0.00),
(10, 5, 1, '2025-12-26 10:52:34', 850.00),
(11, 11, 3, '2025-12-26 23:20:49', 1100.00),
(12, 11, 3, '2025-12-26 23:25:25', 1000.00),
(13, 11, 3, '2025-12-26 23:44:58', 3600.00),
(14, 11, 3, '2025-12-27 00:02:41', 150.00);

--
-- Tetikleyiciler `orders`
--
DELIMITER $$
CREATE TRIGGER `trg_CheckBalanceBeforeOrder` BEFORE INSERT ON `orders` FOR EACH ROW BEGIN
    DECLARE currentBalance DECIMAL(10, 2);

    SELECT Balance INTO currentBalance 
    FROM Users 
    WHERE UserID = NEW.UserID;

    IF currentBalance < NEW.TotalAmount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Insufficient balance! You cannot complete this order.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_UpdateBalanceAfterOrder` AFTER INSERT ON `orders` FOR EACH ROW BEGIN
    UPDATE Users
    SET Balance = Balance - NEW.TotalAmount
    WHERE UserID = NEW.UserID;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `paymentmethods`
--

CREATE TABLE `paymentmethods` (
  `MethodID` int NOT NULL,
  `MethodName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `paymentmethods`
--

INSERT INTO `paymentmethods` (`MethodID`, `MethodName`) VALUES
(1, 'Credit Card'),
(2, 'Debit Card'),
(3, 'Wallet'),
(4, 'PayPal'),
(5, 'Mobile Payment'),
(6, 'Gift Card'),
(7, 'Crypto'),
(8, 'Papara'),
(9, 'Bank Transfer'),
(10, 'QR Code');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `pricechangelogs`
--

CREATE TABLE `pricechangelogs` (
  `LogID` int NOT NULL,
  `GameID` int DEFAULT NULL,
  `OldPrice` decimal(10,2) DEFAULT NULL,
  `NewPrice` decimal(10,2) DEFAULT NULL,
  `ChangeDate` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `reviews`
--

CREATE TABLE `reviews` (
  `ReviewID` int NOT NULL,
  `UserID` int NOT NULL,
  `GameID` int NOT NULL,
  `Rating` tinyint DEFAULT NULL,
  `Comment` text COLLATE utf8mb4_unicode_ci,
  `ReviewDate` datetime DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Tablo döküm verisi `reviews`
--

INSERT INTO `reviews` (`ReviewID`, `UserID`, `GameID`, `Rating`, `Comment`, `ReviewDate`) VALUES
(1, 5, 2, 10, 'Great game.', '2025-12-26 10:52:34'),
(2, 6, 5, 9, 'Very hard but fun.', '2025-12-26 10:52:34'),
(3, 3, 3, 8, 'Graphics are super.', '2025-12-26 10:52:34'),
(4, 2, 10, 10, 'Masterpiece.', '2025-12-26 10:52:34'),
(5, 4, 7, 6, 'Same every year.', '2025-12-26 10:52:34'),
(6, 9, 10, 9, 'Music is legendary.', '2025-12-26 10:52:34'),
(7, 5, 9, 8, 'Scary.', '2025-12-26 10:52:34'),
(8, 6, 2, 5, 'Too many cheaters.', '2025-12-26 10:52:34'),
(9, 3, 4, 10, 'Story is perfect.', '2025-12-26 10:52:34'),
(10, 2, 6, 7, 'It is okay.', '2025-12-26 10:52:34'),
(11, 11, 7, 6, 'it\'s so expensive', '2025-12-26 23:00:41');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `roles`
--

CREATE TABLE `roles` (
  `RoleID` int NOT NULL,
  `RoleName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `roles`
--

INSERT INTO `roles` (`RoleID`, `RoleName`) VALUES
(1, 'Admin'),
(10, 'Banned'),
(9, 'Bot'),
(3, 'Developer'),
(7, 'Editor'),
(2, 'Gamer'),
(8, 'Guest'),
(4, 'Moderator'),
(5, 'Support'),
(6, 'Tester');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `systemrequirements`
--

CREATE TABLE `systemrequirements` (
  `RequirementID` int NOT NULL,
  `GameID` int NOT NULL,
  `OS` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Processor` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MemoryGB` int DEFAULT NULL,
  `GraphicsCard` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `StorageGB` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `systemrequirements`
--

INSERT INTO `systemrequirements` (`RequirementID`, `GameID`, `OS`, `Processor`, `MemoryGB`, `GraphicsCard`, `StorageGB`) VALUES
(1, 1, 'Windows 11', 'Intel i9', 32, 'RTX 4090', 100),
(2, 2, 'Windows 10', 'Intel i5', 8, 'GTX 1060', 50),
(3, 3, 'Windows 11', 'Intel i7', 16, 'RTX 3080', 200),
(4, 4, 'Windows 10', 'AMD Ryzen 7', 16, 'RX 6800', 100),
(5, 5, 'Windows 10', 'Intel i5', 12, 'GTX 1060', 60),
(6, 6, 'Windows 10', 'Intel i7', 16, 'RTX 2060', 50),
(7, 7, 'Windows 11', 'Intel i5', 8, 'GTX 1660', 60),
(8, 8, 'Windows 10', 'AMD Ryzen 5', 16, 'RTX 2080', 130),
(9, 9, 'Windows 10', 'Intel i5', 8, 'GTX 1050', 70),
(10, 10, 'Windows 7', 'Intel Core 2 Duo', 4, 'Integrated', 10);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `tags`
--

CREATE TABLE `tags` (
  `TagID` int NOT NULL,
  `TagName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `tags`
--

INSERT INTO `tags` (`TagID`, `TagName`) VALUES
(3, 'Co-op'),
(6, 'Difficult'),
(8, 'Fantasy'),
(9, 'FPS'),
(10, 'Indie'),
(1, 'Multiplayer'),
(4, 'Open World'),
(7, 'Sci-Fi'),
(2, 'Singleplayer'),
(5, 'Story Rich');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `userachievements`
--

CREATE TABLE `userachievements` (
  `UnlockID` int NOT NULL,
  `UserID` int NOT NULL,
  `AchievementID` int NOT NULL,
  `UnlockDate` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `userachievements`
--

INSERT INTO `userachievements` (`UnlockID`, `UserID`, `AchievementID`, `UnlockDate`) VALUES
(1, 5, 1, '2025-12-26 10:52:34'),
(2, 5, 2, '2025-12-26 10:52:34'),
(3, 6, 3, '2025-12-26 10:52:34'),
(4, 3, 6, '2025-12-26 10:52:34'),
(5, 2, 5, '2025-12-26 10:52:34'),
(6, 4, 8, '2025-12-26 10:52:34'),
(7, 6, 4, '2025-12-26 10:52:34'),
(8, 5, 9, '2025-12-26 10:52:34'),
(9, 3, 7, '2025-12-26 10:52:34'),
(10, 9, 5, '2025-12-26 10:52:34');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `users`
--

CREATE TABLE `users` (
  `UserID` int NOT NULL,
  `RoleID` int NOT NULL,
  `Username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Balance` decimal(10,2) DEFAULT '0.00',
  `RegistrationDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `Avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  `About` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `users`
--

INSERT INTO `users` (`UserID`, `RoleID`, `Username`, `Email`, `Password`, `Balance`, `RegistrationDate`, `Avatar`, `About`) VALUES
(1, 1, 'GroupAdmin', 'admin@steamproject.com', 'admin123', 0.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(2, 2, 'AhmetKaan', 'ahmet@mail.com', 'pass1', 500.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(3, 2, 'MuhammetEnis', 'enis@mail.com', 'pass2', 1200.50, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(4, 2, 'EnverHalit', 'enver@mail.com', 'pass3', 3000.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(5, 2, 'MustafaGok', 'mustafa@mail.com', 'pass4', 150.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(6, 2, 'BurakKurt', 'burak@mail.com', 'pass5', 750.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(7, 3, 'ValveDev', 'contact@valve.com', 'securepass', 0.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(8, 3, 'RockstarDev', 'dev@rockstar.com', 'devpass', 0.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(9, 2, 'ProGamer_99', 'pro@mail.com', 'gamepass', 25.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(10, 2, 'CasualPlayer', 'casual@mail.com', '123456', 0.00, '2025-12-26 10:52:34', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL),
(11, 1, 'deneme1', 'knsln@gmail.com', '$2y$10$ljqrzJ39HJmr7Kmkl5q.TeuV26x5se7vhwcogCEOlj8RnpaVTSD5W', 100.00, '2025-12-26 22:59:56', 'https://www.beetekno.com/media/932672ce-e67e-4a66-8c6d-7aba097104fe-860x630.webp', 'merhaba'),
(12, 2, 'deneme2', 'kkkk@gmail.com', '$2y$10$AqawOmddQ2Sw4K3zeZYI4u8xcaQVTjyKZV22l90RvUcEihKjHFN3q', 0.00, '2025-12-26 23:49:00', 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', NULL);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `wishlist`
--

CREATE TABLE `wishlist` (
  `WishlistID` int NOT NULL,
  `UserID` int NOT NULL,
  `GameID` int NOT NULL,
  `AddedDate` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `wishlist`
--

INSERT INTO `wishlist` (`WishlistID`, `UserID`, `GameID`, `AddedDate`) VALUES
(1, 2, 3, '2025-12-26 10:52:34'),
(2, 2, 4, '2025-12-26 10:52:34'),
(3, 5, 1, '2025-12-26 10:52:34'),
(4, 6, 8, '2025-12-26 10:52:34'),
(5, 4, 10, '2025-12-26 10:52:34'),
(6, 9, 3, '2025-12-26 10:52:34'),
(7, 3, 1, '2025-12-26 10:52:34'),
(8, 5, 8, '2025-12-26 10:52:34'),
(9, 2, 7, '2025-12-26 10:52:34'),
(10, 6, 9, '2025-12-26 10:52:34');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`AchievementID`),
  ADD KEY `GameID` (`GameID`);

--
-- Tablo için indeksler `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Tablo için indeksler `developers`
--
ALTER TABLE `developers`
  ADD PRIMARY KEY (`DeveloperID`);

--
-- Tablo için indeksler `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`FriendshipID`),
  ADD KEY `User1_ID` (`User1_ID`),
  ADD KEY `User2_ID` (`User2_ID`);

--
-- Tablo için indeksler `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`GameID`),
  ADD KEY `DeveloperID` (`DeveloperID`),
  ADD KEY `idx_games_title` (`Title`);

--
-- Tablo için indeksler `game_category`
--
ALTER TABLE `game_category`
  ADD PRIMARY KEY (`GameID`,`CategoryID`),
  ADD KEY `CategoryID` (`CategoryID`);

--
-- Tablo için indeksler `game_tag`
--
ALTER TABLE `game_tag`
  ADD PRIMARY KEY (`GameID`,`TagID`),
  ADD KEY `TagID` (`TagID`);

--
-- Tablo için indeksler `library`
--
ALTER TABLE `library`
  ADD PRIMARY KEY (`RecordID`),
  ADD UNIQUE KEY `UserID` (`UserID`,`GameID`),
  ADD KEY `GameID` (`GameID`),
  ADD KEY `idx_library_user_game` (`UserID`,`GameID`);

--
-- Tablo için indeksler `orderdetails`
--
ALTER TABLE `orderdetails`
  ADD PRIMARY KEY (`DetailID`),
  ADD KEY `OrderID` (`OrderID`),
  ADD KEY `GameID` (`GameID`);

--
-- Tablo için indeksler `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `MethodID` (`MethodID`),
  ADD KEY `idx_orders_userid` (`UserID`);

--
-- Tablo için indeksler `paymentmethods`
--
ALTER TABLE `paymentmethods`
  ADD PRIMARY KEY (`MethodID`);

--
-- Tablo için indeksler `pricechangelogs`
--
ALTER TABLE `pricechangelogs`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `GameID` (`GameID`);

--
-- Tablo için indeksler `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `GameID` (`GameID`);

--
-- Tablo için indeksler `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`RoleID`),
  ADD UNIQUE KEY `RoleName` (`RoleName`);

--
-- Tablo için indeksler `systemrequirements`
--
ALTER TABLE `systemrequirements`
  ADD PRIMARY KEY (`RequirementID`),
  ADD UNIQUE KEY `GameID` (`GameID`);

--
-- Tablo için indeksler `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`TagID`),
  ADD UNIQUE KEY `TagName` (`TagName`);

--
-- Tablo için indeksler `userachievements`
--
ALTER TABLE `userachievements`
  ADD PRIMARY KEY (`UnlockID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `AchievementID` (`AchievementID`);

--
-- Tablo için indeksler `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `RoleID` (`RoleID`),
  ADD KEY `idx_users_username` (`Username`);

--
-- Tablo için indeksler `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`WishlistID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `GameID` (`GameID`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `achievements`
--
ALTER TABLE `achievements`
  MODIFY `AchievementID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `categories`
--
ALTER TABLE `categories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `developers`
--
ALTER TABLE `developers`
  MODIFY `DeveloperID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Tablo için AUTO_INCREMENT değeri `friends`
--
ALTER TABLE `friends`
  MODIFY `FriendshipID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Tablo için AUTO_INCREMENT değeri `games`
--
ALTER TABLE `games`
  MODIFY `GameID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Tablo için AUTO_INCREMENT değeri `library`
--
ALTER TABLE `library`
  MODIFY `RecordID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Tablo için AUTO_INCREMENT değeri `orderdetails`
--
ALTER TABLE `orderdetails`
  MODIFY `DetailID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Tablo için AUTO_INCREMENT değeri `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Tablo için AUTO_INCREMENT değeri `paymentmethods`
--
ALTER TABLE `paymentmethods`
  MODIFY `MethodID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `pricechangelogs`
--
ALTER TABLE `pricechangelogs`
  MODIFY `LogID` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `reviews`
--
ALTER TABLE `reviews`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `roles`
--
ALTER TABLE `roles`
  MODIFY `RoleID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `systemrequirements`
--
ALTER TABLE `systemrequirements`
  MODIFY `RequirementID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `tags`
--
ALTER TABLE `tags`
  MODIFY `TagID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `userachievements`
--
ALTER TABLE `userachievements`
  MODIFY `UnlockID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Tablo için AUTO_INCREMENT değeri `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `WishlistID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`User1_ID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`User2_ID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `games_ibfk_1` FOREIGN KEY (`DeveloperID`) REFERENCES `developers` (`DeveloperID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `game_category`
--
ALTER TABLE `game_category`
  ADD CONSTRAINT `game_category_ibfk_1` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_category_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `game_tag`
--
ALTER TABLE `game_tag`
  ADD CONSTRAINT `game_tag_ibfk_1` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_tag_ibfk_2` FOREIGN KEY (`TagID`) REFERENCES `tags` (`TagID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `library`
--
ALTER TABLE `library`
  ADD CONSTRAINT `library_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `library_ibfk_2` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `orderdetails`
--
ALTER TABLE `orderdetails`
  ADD CONSTRAINT `orderdetails_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`) ON DELETE CASCADE,
  ADD CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`);

--
-- Tablo kısıtlamaları `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`MethodID`) REFERENCES `paymentmethods` (`MethodID`);

--
-- Tablo kısıtlamaları `pricechangelogs`
--
ALTER TABLE `pricechangelogs`
  ADD CONSTRAINT `pricechangelogs_ibfk_1` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `systemrequirements`
--
ALTER TABLE `systemrequirements`
  ADD CONSTRAINT `systemrequirements_ibfk_1` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `userachievements`
--
ALTER TABLE `userachievements`
  ADD CONSTRAINT `userachievements_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userachievements_ibfk_2` FOREIGN KEY (`AchievementID`) REFERENCES `achievements` (`AchievementID`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`);

--
-- Tablo kısıtlamaları `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`GameID`) REFERENCES `games` (`GameID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
