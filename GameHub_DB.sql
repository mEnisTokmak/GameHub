/*
  PROJECT: GameHub - Steam-Like Game Distribution Platform
  COURSE: BYM 301 - Database Management
  GROUP MEMBERS:
  - Ahmet Kaan ARSLAN (230601013)
  - Muhammet Enis TOKMAK (230601010)
  - Enver Halit EREN (230601029)
  - Mustafa GÖK (230601032)
  - Burak KURT (230601018)
*/

-- 1. DATABASE CREATION AND SETTINGS
DROP DATABASE IF EXISTS GameHub;
CREATE DATABASE GameHub DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE GameHub;

-- SECTION 1: TABLE CREATION

-- 1. ROLES
CREATE TABLE Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

-- 2. USERS
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    RoleID INT NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Balance DECIMAL(10, 2) DEFAULT 0.00,
    RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Avatar VARCHAR(255) DEFAULT 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', -- YENİ EKLENDİ
    About TEXT, -- YENİ EKLENDİ
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- 3. DEVELOPERS
CREATE TABLE Developers (
    DeveloperID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL,
    Website VARCHAR(150),
    FoundationYear INT
);

-- 4. CATEGORIES
CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(255)
);

-- 5. GAMES
CREATE TABLE Games (
    GameID INT AUTO_INCREMENT PRIMARY KEY,
    DeveloperID INT NOT NULL,
    Title VARCHAR(150) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ReleaseDate DATE,
    SizeGB DECIMAL(5, 2),
    IsApproved TINYINT DEFAULT 1, -- Backend kontrolü için gerekli
    ImageUrl VARCHAR(255) DEFAULT 'https://placehold.co/600x900?text=GAMEHUB',
    HeaderUrl VARCHAR(255) DEFAULT 'https://placehold.co/600x900?text=GAMEHUB',
    FOREIGN KEY (DeveloperID) REFERENCES Developers(DeveloperID) ON DELETE CASCADE
);

-- 6. SYSTEM REQUIREMENTS (1:1 Relationship)
CREATE TABLE SystemRequirements (
    RequirementID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL UNIQUE,
    OS VARCHAR(100), -- Operating System
    Processor VARCHAR(150), -- CPU
    MemoryGB INT, -- RAM
    GraphicsCard VARCHAR(150), -- GPU
    StorageGB INT,
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE
);

-- 7. TAGS
CREATE TABLE Tags (
    TagID INT AUTO_INCREMENT PRIMARY KEY,
    TagName VARCHAR(50) NOT NULL UNIQUE
);

-- 8. GAME_CATEGORY (M:N Relationship)
CREATE TABLE Game_Category (
    GameID INT,
    CategoryID INT,
    PRIMARY KEY (GameID, CategoryID),
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE
);

-- 9. GAME_TAG (M:N Relationship)
CREATE TABLE Game_Tag (
    GameID INT,
    TagID INT,
    PRIMARY KEY (GameID, TagID),
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE,
    FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE
);

-- 10. LIBRARY (M:N Relationship)
CREATE TABLE Library (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GameID INT NOT NULL,
    PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE,
    UNIQUE (UserID, GameID)
);

-- 11. WISHLIST (M:N Relationship)
CREATE TABLE Wishlist (
    WishlistID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GameID INT NOT NULL,
    AddedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE
);

-- 12. REVIEWS (1:N Relationship)
CREATE TABLE Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GameID INT NOT NULL,
    Rating TINYINT CHECK (Rating BETWEEN 1 AND 10),
    Comment TEXT,
    ReviewDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE
);

-- 13. PAYMENT METHODS
CREATE TABLE PaymentMethods (
    MethodID INT AUTO_INCREMENT PRIMARY KEY,
    MethodName VARCHAR(50) NOT NULL
);

-- 14. ORDERS
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    MethodID INT NOT NULL,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (MethodID) REFERENCES PaymentMethods(MethodID)
);

-- 15. ORDER DETAILS
CREATE TABLE OrderDetails (
    DetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    GameID INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- 16. ACHIEVEMENTS
CREATE TABLE Achievements (
    AchievementID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    PointValue INT DEFAULT 10,
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE
);

-- 17. USER ACHIEVEMENTS (M:N Relationship)
CREATE TABLE UserAchievements (
    UnlockID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    AchievementID INT NOT NULL,
    UnlockDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (AchievementID) REFERENCES Achievements(AchievementID) ON DELETE CASCADE
);

-- 18. FRIENDS (Social Network - Recursive Relationship)
CREATE TABLE Friends (
    FriendshipID INT AUTO_INCREMENT PRIMARY KEY,
    User1_ID INT NOT NULL,
    User2_ID INT NOT NULL,
    Status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    FriendDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User1_ID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (User2_ID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- 19. PRICE CHANGE LOGS (For Trigger Tracking)
CREATE TABLE PriceChangeLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    GameID INT,
    OldPrice DECIMAL(10,2),
    NewPrice DECIMAL(10,2),
    ChangeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GameID) REFERENCES Games(GameID) ON DELETE CASCADE
);

-- SECTION 2: DATA INSERTION

-- 1. Roles
INSERT INTO Roles (RoleName) VALUES ('Admin'), ('Gamer'), ('Developer'), ('Moderator'), ('Support'), ('Tester'), ('Editor'), ('Guest'), ('Bot'), ('Banned');

-- 2. Users
INSERT INTO Users (RoleID, Username, Email, Password, Balance, Avatar) VALUES
(1, 'GroupAdmin', 'admin@steamproject.com', 'admin123', 0.00, 'https://avatars.githubusercontent.com/u/1?v=4'),
(2, 'AhmetKaan', 'ahmet@mail.com', 'pass1', 500.00, 'https://avatars.githubusercontent.com/u/2?v=4'),
(2, 'MuhammetEnis', 'enis@mail.com', 'pass2', 1200.50, 'https://avatars.githubusercontent.com/u/3?v=4'),
(2, 'EnverHalit', 'enver@mail.com', 'pass3', 3000.00, 'https://avatars.githubusercontent.com/u/4?v=4'),
(2, 'MustafaGok', 'mustafa@mail.com', 'pass4', 150.00, 'https://avatars.githubusercontent.com/u/5?v=4'),
(2, 'BurakKurt', 'burak@mail.com', 'pass5', 750.00, 'https://avatars.githubusercontent.com/u/6?v=4'),
(3, 'ValveDev', 'contact@valve.com', 'securepass', 0.00, DEFAULT),
(3, 'RockstarDev', 'dev@rockstar.com', 'devpass', 0.00, DEFAULT),
(2, 'ProGamer_99', 'pro@mail.com', 'gamepass', 25.00, DEFAULT),
(2, 'CasualPlayer', 'casual@mail.com', '123456', 0.00, DEFAULT);

-- 3. Developers
INSERT INTO Developers (CompanyName, Website, FoundationYear) VALUES
('Valve', 'valvesoftware.com', 1996),
('Ubisoft', 'ubisoft.com', 1986),
('Rockstar Games', 'rockstargames.com', 1998),
('CD Projekt Red', 'cdprojekt.com', 2002),
('Electronic Arts', 'ea.com', 1982),
('Bethesda', 'bethesda.net', 1986),
('Capcom', 'capcom.com', 1979),
('FromSoftware', 'fromsoftware.jp', 1986),
('Naughty Dog', 'naughtydog.com', 1984),
('Indie Studio', 'indiestudio.io', 2023);

-- 4. Categories
INSERT INTO Categories (CategoryName) VALUES ('Action'), ('RPG'), ('Strategy'), ('Simulation'), ('Sports&Racing'), ('Horror'), ('Adventure'), ('Puzzle');

-- 5. Games
INSERT INTO Games (DeveloperID, Title, Description, Price, ReleaseDate, SizeGB, IsApproved, ImageUrl, HeaderUrl) VALUES
(3, 'GTA V', 'Massive open-world crime simulation.', 900.00, '2013-09-17', 110.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg'),
(3, 'Red Dead Redemption 2', 'Epic story set in the unforgiving Wild West.', 1150.00, '2019-12-05', 120.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg'),
(9, 'God of War', 'Kratos\' journey in the world of Norse mythology.', 899.00, '2022-01-14', 70.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_hero.jpg'),
(7, 'Resident Evil 4 Remake', 'The return of the survival horror classic.', 1200.00, '2023-03-24', 65.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/library_hero.jpg'),

(4, 'The Witcher 3: Wild Hunt', 'The story of monster hunter Geralt of Rivia.', 400.00, '2015-05-19', 50.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_hero.jpg'),
(8, 'Elden Ring', 'A brutal and fascinating open world action RPG.', 1400.00, '2022-02-25', 60.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg'),
(4, 'Cyberpunk 2077', 'An open-world, action-adventure story set in Night City.', 1250.00, '2020-12-10', 70.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg'),
(6, 'Baldurs Gate 3', 'Legendary RPG set in the Dungeons & Dragons universe.', 1500.00, '2023-08-03', 150.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_hero.jpg'),

(1, 'Civilization VI', 'Build and manage your greatest civilization.', 350.00, '2016-10-21', 12.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/289070/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/289070/library_hero.jpg'),
(1, 'Age of Empires IV', 'Historical real-time strategy warfare.', 800.00, '2021-10-28', 50.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/library_hero.jpg'),
(10, 'Cities: Skylines II', 'The most realistic city builder ever.', 950.00, '2023-10-24', 60.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/949230/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/949230/library_hero.jpg'),

(1, 'Counter-Strike 2', 'The next era of tactical shooter.', 0.00, '2023-09-27', 30.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/library_hero.jpg'),
(1, 'Left 4 Dead 2', 'Zombie apocalypse survival co-op game.', 105.00, '2009-11-17', 15.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/550/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/550/library_hero.jpg'),
(2, 'Tom Clancys Rainbow Six Siege', 'Tactical FPS with destructible environments.', 300.00, '2015-12-01', 60.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/359550/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/359550/library_hero.jpg'),

(5, 'EA SPORTS FC 24', 'The worlds game. Realistic football simulation.', 1800.00, '2023-09-29', 100.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/library_hero.jpg'),
(5, 'F1 23', 'The official videogame of the 2023 FIA Formula One World Championship.', 1400.00, '2023-06-16', 80.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2108330/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2108330/library_hero.jpg'),
(10, 'Forza Horizon 5', 'Ultimate open world racing adventure in Mexico.', 1200.00, '2021-11-09', 130.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/library_hero.jpg'),

(10, 'Stardew Valley', 'Open-ended country-life RPG.', 150.00, '2016-02-26', 1.5, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/library_hero.jpg'),
(10, 'Euro Truck Simulator 2', 'Drive across Europe as the king of the road.', 200.00, '2012-10-19', 12.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/227300/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/227300/library_hero.jpg'),
(1, 'Portal 2', 'Award-winning physics-based puzzle game.', 105.00, '2011-04-19', 8.0, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/library_600x900.jpg', 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/library_hero.jpg');

-- 6. System Requirements
INSERT INTO SystemRequirements (GameID, OS, Processor, MemoryGB, GraphicsCard, StorageGB) VALUES
(11, 'Windows 10', 'Intel i7 9700K', 16, 'RTX 3080', 60), -- Cities Skylines 2
(12, 'Windows 10', 'Intel i5 7500', 8, 'GTX 1060', 85),  -- CS2
(13, 'Windows 7', 'Intel Core 2 Duo', 4, 'GeForce 6600', 15), -- L4D2
(14, 'Windows 10', 'Intel i5 4590', 8, 'GTX 960', 60), -- R6 Siege
(15, 'Windows 10', 'Intel i7 6700', 12, 'GTX 1660', 100), -- FC 24
(16, 'Windows 10', 'Intel i5 9600K', 16, 'RTX 2060', 80), -- F1 23
(17, 'Windows 10', 'Ryzen 5 1500X', 16, 'GTX 1070', 110), -- Forza 5
(18, 'Windows 10', 'Intel Core 2 Duo', 4, 'Integrated', 2), -- Stardew Valley
(19, 'Windows 7', 'Intel Core i5', 8, 'GTX 760', 12), -- ETS 2
(20, 'Windows 8', 'Intel Core 2 Duo', 4, 'Integrated', 8); -- Portal 2

-- 7. Tags
INSERT INTO Tags (TagName) VALUES ('Multiplayer'), ('Singleplayer'), ('Co-op'), ('Open World'), ('Story Rich'), ('Difficult'), ('Sci-Fi'), ('Fantasy'), ('FPS'), ('Indie');

-- 8. Game_Category
INSERT INTO Game_Category (GameID, CategoryID) VALUES
(1, 1), (1, 7), (1, 4), (2, 1), (2, 7), (3, 1), (3, 7), (4, 6), (4, 1), (5, 2), (5, 7), (6, 2), (6, 1), (7, 2), (7, 1), (7, 4), (8, 2), (8, 3), (9, 3), (10, 3), (11, 4), (11, 3), (12, 1), (13, 6), (13, 1), (14, 1), (14, 3), (15, 5), (16, 5), (16, 4), (17, 5), (17, 4), (18, 4), (18, 2), (19, 4), (20, 8), (20, 7);

-- 9. Game_Tag
INSERT INTO Game_Tag (GameID, TagID) VALUES
(2, 1), (2, 9), (3, 2), (3, 4), (5, 2), (5, 6), (10, 10), (1, 2), (4, 2), (7, 1), (8, 7), (9, 2);

-- 10. Payment Methods
INSERT INTO PaymentMethods (MethodName) VALUES ('Credit Card'), ('Debit Card'), ('Wallet'), ('PayPal'), ('Mobile Payment'), ('Gift Card'), ('Crypto'), ('Papara'), ('Bank Transfer'), ('QR Code');

-- 11. Orders
INSERT INTO Orders (UserID, MethodID, TotalAmount) VALUES
(2, 1, 150.00), (3, 3, 2700.00), (4, 2, 0.00), (5, 1, 899.00), (6, 4, 1100.00), (2, 3, 900.00), (3, 1, 1500.00), (9, 5, 150.00), (6, 2, 0.00), (5, 1, 850.00);

-- 12. Order Details
INSERT INTO OrderDetails (OrderID, GameID, UnitPrice) VALUES
(1, 10, 150.00), (2, 3, 1500.00), (2, 4, 1200.00), (3, 2, 0.00), (4, 5, 899.00), (5, 7, 1100.00), (6, 6, 900.00), (7, 3, 1500.00), (8, 10, 150.00), (10, 9, 850.00);

-- 13. Library
INSERT INTO Library (UserID, GameID) VALUES
(2, 10), (3, 3), (3, 4), (4, 2), (5, 5), (6, 7), (2, 6), (9, 10), (6, 2), (5, 9);

-- 14. Wishlist
INSERT INTO Wishlist (UserID, GameID) VALUES
(2, 3), (2, 4), (5, 1), (6, 8), (4, 10), (9, 3), (3, 1), (5, 8), (2, 7), (6, 9);

-- 15. Reviews
INSERT INTO Reviews (UserID, GameID, Rating, Comment) VALUES
(2, 1, 10, 'Still the king of open world games. Legendary.'),
(3, 1, 9, 'Great story, but online mode has too many hackers.'),
(4, 2, 10, 'A true masterpiece. The story is emotional and deep.'),
(5, 2, 10, 'Visuals are breathtaking. Arthur Morgan is a legend.'),
(2, 3, 10, 'Combat is satisfying and the graphics are insane.'),
(9, 3, 9, 'Kratos is back and better than ever. Boy!'),
(3, 4, 9, 'Great remake, the atmosphere is terrifying.'),
(3, 5, 10, 'Best RPG ever made. The story is incredible.'),
(6, 5, 10, 'I spent more time playing Gwent than the actual game.'),
(5, 6, 9, 'Very difficult but the world design is beautiful.'),
(9, 6, 10, 'I died 100 times but I cannot stop playing.'),
(2, 7, 8, 'Night City looks amazing. Gameplay is much better now.'),
(4, 8, 10, 'The amount of choices in this game is mind-blowing.'),
(3, 9, 8, 'Just one more turn... very addictive strategy game.'),
(5, 10, 9, 'Classic strategy feeling with modern graphics.'),
(6, 11, 5, 'Optimization is bad, my PC is struggling.'),
(6, 12, 7, 'Graphics are good but hitboxes feel weird.'),
(4, 12, 8, 'Tactical gameplay is unmatched, needs better anti-cheat.'),
(2, 13, 9, 'Playing co-op with friends is hilarious.'),
(5, 14, 8, 'Steep learning curve but very rewarding when you win.'),
(3, 15, 6, 'Same game as last year, but fun with friends.'),
(4, 16, 9, 'Driving feels very realistic with a steering wheel.'),
(6, 17, 10, 'Mexico map is huge and beautiful. Best racing game.'),
(4, 18, 10, 'So relaxing and peaceful. I love this game.'),
(5, 19, 9, 'Driving trucks while listening to radio is therapy.'),
(6, 20, 10, 'Best puzzle game ever. The dialogue is hilarious.');

-- 16. Achievements
INSERT INTO Achievements (GameID, Title, Description, PointValue) VALUES
(1, 'Welcome to Los Santos', 'GTA V giriş görevini tamamla.', 10),
(2, 'Legend of the West', 'RDR2 hikayesini %100 bitir.', 50),
(3, 'God of War', 'Tüm valkürleri yen.', 50),
(4, 'Survivor', 'Köyden sağ çık.', 20),
(5, 'Child of Prophecy', 'Oyunu herhangi bir zorlukta bitir.', 30),
(6, 'Elden Lord', 'Elden Ring tahtına otur.', 100), -- Artık Doğru Yerde (GameID 6)
(7, 'Breathtaking', 'Tüm siberkasapları yen.', 30),
(8, 'Critical Hit', 'Zarda 20 at.', 10),
(12, 'Global Elite', 'Rekabetçi modda rütbe atla.', 25),
(15, 'Top Scorer', 'Bir maçta 5 gol at.', 15),
(18, 'Millionaire', '1.000.000 altın kazan.', 40),
(19, 'Long Haul', '10.000 km yol yap.', 20);

-- 17. User Achievements
-- 17. USER ACHIEVEMENTS (Düzeltilmiş ID'ler)
-- Not: Başarım ID'leri 1'den 12'ye kadar olduğu için 15 ve 18 hatalıydı. Düzeltildi.
INSERT INTO UserAchievements (UserID, AchievementID) VALUES
(2, 1), (4, 2), (5, 6), (3, 9), (6, 11), (2, 3), (4, 10);

-- 18. Friends
INSERT INTO Friends (User1_ID, User2_ID, Status) VALUES
(2, 3, 'Accepted'), (2, 5, 'Accepted'), (3, 5, 'Pending'), (5, 6, 'Accepted'), (6, 4, 'Rejected'), (4, 9, 'Accepted'), (9, 2, 'Pending'), (3, 6, 'Accepted'), (5, 9, 'Accepted'), (2, 6, 'Rejected');

-- SECTION 3: TRIGGERS (MySQL Workbench & Ampps Compatible)

DELIMITER //

-- Trigger 1: Insufficient Balance Check
-- Runs BEFORE insert on Orders. Cancels the transaction if the user's balance is lower than the order amount.
CREATE TRIGGER trg_CheckBalanceBeforeOrder
BEFORE INSERT ON Orders
FOR EACH ROW
BEGIN
    DECLARE currentBalance DECIMAL(10, 2);

    SELECT Balance INTO currentBalance 
    FROM Users 
    WHERE UserID = NEW.UserID;

    IF currentBalance < NEW.TotalAmount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Insufficient balance! You cannot complete this order.';
    END IF;
END //

-- Trigger 2: Deduct Balance After Order
-- Automatically deducts the order total from the user's balance after a successful order.
CREATE TRIGGER trg_UpdateBalanceAfterOrder
AFTER INSERT ON Orders
FOR EACH ROW
BEGIN
    UPDATE Users
    SET Balance = Balance - NEW.TotalAmount
    WHERE UserID = NEW.UserID;
END //

-- Trigger 3: Price Change Log
-- Logs old and new prices whenever a game's price is updated.
CREATE TRIGGER trg_LogPriceChanges
AFTER UPDATE ON Games
FOR EACH ROW
BEGIN
    IF OLD.Price <> NEW.Price THEN
        INSERT INTO PriceChangeLogs (GameID, OldPrice, NewPrice)
        VALUES (OLD.GameID, OLD.Price, NEW.Price);
    END IF;
END //

-- Trigger 4: Auto-Delivery to Library
-- Automatically adds purchased games to the user's library upon order completion.
CREATE TRIGGER trg_AddGameToLibraryAfterPurchase
AFTER INSERT ON OrderDetails
FOR EACH ROW
BEGIN
    DECLARE v_UserID INT;
    SELECT UserID INTO v_UserID FROM Orders WHERE OrderID = NEW.OrderID;
    
    INSERT IGNORE INTO Library (UserID, GameID)
    VALUES (v_UserID, NEW.GameID);
END //

DELIMITER ;

-- SECTION 4: STORED PROCEDURES (Course Requirements: Complex Joins & 15+ Procedures)

DELIMITER //

-- 1. User Profile Summary (4-Way Join)
CREATE PROCEDURE GetUserProfileSummary(IN p_UserID INT)
BEGIN
    SELECT u.Username, r.RoleName, 
           (SELECT COUNT(*) FROM Library WHERE UserID = u.UserID) as TotalGames,
           IFNULL(SUM(a.PointValue), 0) as TotalAchievementPoints
    FROM Users u
    JOIN Roles r ON u.RoleID = r.RoleID
    LEFT JOIN UserAchievements ua ON u.UserID = ua.UserID
    LEFT JOIN Achievements a ON ua.AchievementID = a.AchievementID
    WHERE u.UserID = p_UserID
    GROUP BY u.UserID;
END //

-- 2. Detailed Purchase History (4-Way Join)
CREATE PROCEDURE GetDetailedOrderHistory(IN p_UserID INT)
BEGIN
    SELECT o.OrderDate, g.Title, od.UnitPrice, pm.MethodName
    FROM Orders o
    JOIN OrderDetails od ON o.OrderID = od.OrderID
    JOIN Games g ON od.GameID = g.GameID
    JOIN PaymentMethods pm ON o.MethodID = pm.MethodID
    WHERE o.UserID = p_UserID
    ORDER BY o.OrderDate DESC;
END //

-- 3. Storefront by Developer & Categories (3-Way Join)
CREATE PROCEDURE GetStoreFrontByDeveloper(IN p_DevName VARCHAR(100))
BEGIN
    SELECT g.Title, g.Price, d.CompanyName, GROUP_CONCAT(c.CategoryName) as Categories
    FROM Games g
    JOIN Developers d ON g.DeveloperID = d.DeveloperID
    JOIN Game_Category gc ON g.GameID = gc.GameID
    JOIN Categories c ON gc.CategoryID = c.CategoryID
    WHERE d.CompanyName LIKE CONCAT('%', p_DevName, '%')
    GROUP BY g.GameID;
END //

-- 4. Shared Friends' Games (Social Discovery - 3-Way Join)
CREATE PROCEDURE GetFriendsSharedGames(IN p_UserID INT)
BEGIN
    SELECT DISTINCT g.Title, u_friend.Username as OwnedByFriend
    FROM Friends f
    JOIN Users u_friend ON (f.User2_ID = u_friend.UserID OR f.User1_ID = u_friend.UserID)
    JOIN Library l ON u_friend.UserID = l.UserID
    JOIN Games g ON l.GameID = g.GameID
    WHERE (f.User1_ID = p_UserID OR f.User2_ID = p_UserID) 
      AND u_friend.UserID != p_UserID 
      AND f.Status = 'Accepted';
END //

-- 5. Game Technical Specs & Developer (3-Way Join)
CREATE PROCEDURE GetGameTechnicalDetails(IN p_GameID INT)
BEGIN
    SELECT g.Title, d.CompanyName, sr.OS, sr.Processor, sr.GraphicsCard, sr.MemoryGB
    FROM Games g
    JOIN Developers d ON g.DeveloperID = d.DeveloperID
    JOIN SystemRequirements sr ON g.GameID = sr.GameID
    WHERE g.GameID = p_GameID;
END //

-- 6. Top 10 Achievement Hunters (3-Way Join)
CREATE PROCEDURE GetTopAchievementHunters()
BEGIN
    SELECT u.Username, COUNT(ua.UnlockID) as AchievementsUnlocked, SUM(a.PointValue) as TotalPoints
    FROM Users u
    JOIN UserAchievements ua ON u.UserID = ua.UserID
    JOIN Achievements a ON ua.AchievementID = a.AchievementID
    GROUP BY u.UserID
    ORDER BY TotalPoints DESC
    LIMIT 10;
END //

-- 7. Revenue Report by Category (3-Way Join)
CREATE PROCEDURE GetRevenueByCategory()
BEGIN
    SELECT c.CategoryName, COUNT(od.DetailID) as SalesCount, SUM(od.UnitPrice) as TotalRevenue
    FROM Categories c
    JOIN Game_Category gc ON c.CategoryID = gc.CategoryID
    JOIN OrderDetails od ON gc.GameID = od.GameID
    GROUP BY c.CategoryID
    ORDER BY TotalRevenue DESC;
END //

-- 8. Locked Achievements per Game (3-Way Join)
CREATE PROCEDURE GetLockedAchievements(IN p_UserID INT, IN p_GameID INT)
BEGIN
    SELECT a.Title, a.Description, a.PointValue
    FROM Achievements a
    WHERE a.GameID = p_GameID 
      AND a.AchievementID NOT IN (
          SELECT AchievementID FROM UserAchievements WHERE UserID = p_UserID
      );
END //

-- 9. Game Rating Statistics
CREATE PROCEDURE GetGameRatingStats(IN p_GameID INT)
BEGIN
    SELECT g.Title, IFNULL(AVG(r.Rating), 0) as AvgRating, COUNT(r.ReviewID) as ReviewCount
    FROM Games g
    LEFT JOIN Reviews r ON g.GameID = r.GameID
    WHERE g.GameID = p_GameID
    GROUP BY g.GameID;
END //

-- 10. Total Wishlist Valuation
CREATE PROCEDURE GetWishlistTotalValue(IN p_UserID INT)
BEGIN
    SELECT u.Username, COUNT(w.WishlistID) as GameCount, SUM(g.Price) as TotalCost
    FROM Wishlist w
    JOIN Games g ON w.GameID = g.GameID
    JOIN Users u ON w.UserID = u.UserID
    WHERE w.UserID = p_UserID;
END //

-- 11. Search Games by Price Range
CREATE PROCEDURE GetGamesByPriceRange(IN p_Min DECIMAL(10,2), IN p_Max DECIMAL(10,2))
BEGIN
    SELECT Title, Price, SizeGB FROM Games 
    WHERE Price BETWEEN p_Min AND p_Max 
    ORDER BY Price ASC;
END //

-- 12. Top Selling Games (Replaces Most Played)
-- Useful for "Best Sellers" section on the store homepage.
CREATE PROCEDURE GetBestSellingGames()
BEGIN
    SELECT g.Title, COUNT(l.RecordID) as TotalSales
    FROM Games g
    LEFT JOIN Library l ON g.GameID = l.GameID
    GROUP BY g.GameID
    ORDER BY TotalSales DESC;
END //

-- 13. Secure Balance Deposit
CREATE PROCEDURE DepositBalance(IN p_UserID INT, IN p_Amount DECIMAL(10,2))
BEGIN
    UPDATE Users SET Balance = Balance + p_Amount WHERE UserID = p_UserID;
END //

-- 14. Rapid Developer & Game Deployment
CREATE PROCEDURE QuickAddDeveloperAndGame(
    IN p_CompName VARCHAR(100), IN p_GameTitle VARCHAR(150), IN p_Price DECIMAL(10,2)
)
BEGIN
    INSERT INTO Developers (CompanyName) VALUES (p_CompName);
    INSERT INTO Games (DeveloperID, Title, Price) VALUES (LAST_INSERT_ID(), p_GameTitle, p_Price);
END //

-- 15. View Incoming Pending Friend Requests
CREATE PROCEDURE GetPendingFriendRequests(IN p_UserID INT)
BEGIN
    SELECT u.Username, f.FriendDate
    FROM Friends f
    JOIN Users u ON f.User1_ID = u.UserID
    WHERE f.User2_ID = p_UserID AND f.Status = 'Pending';
END //

-- 16. Filter Games by Modern Developers (Post-Year Filter)
CREATE PROCEDURE GetModernDevsGames(IN p_Year INT)
BEGIN
    SELECT d.CompanyName, g.Title, g.ReleaseDate
    FROM Developers d
    JOIN Games g ON d.DeveloperID = g.DeveloperID
    WHERE d.FoundationYear >= p_Year;
END //

-- 17. List All Tags & Categories for a Specific Game
CREATE PROCEDURE GetGameTagsAndCategories(IN p_GameID INT)
BEGIN
    SELECT g.Title, 
           (SELECT GROUP_CONCAT(TagName) FROM Tags t JOIN Game_Tag gt ON t.TagID = gt.TagID WHERE gt.GameID = g.GameID) as AllTags,
           (SELECT GROUP_CONCAT(CategoryName) FROM Categories c JOIN Game_Category gc ON c.CategoryID = gc.CategoryID WHERE gc.GameID = g.GameID) as AllCategories
    FROM Games g
    WHERE g.GameID = p_GameID;
END //

DELIMITER ;

-- SECTION 5: PERFORMANCE OPTIMIZATION (Course Requirement: Traffic Reduction)
-- Adding indexes to frequently searched/joined columns to optimize performance.

CREATE INDEX idx_users_username ON Users(Username);
CREATE INDEX idx_games_title ON Games(Title);
CREATE INDEX idx_orders_userid ON Orders(UserID);
CREATE INDEX idx_library_user_game ON Library(UserID, GameID);
