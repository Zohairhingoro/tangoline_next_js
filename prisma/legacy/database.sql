CREATE DATABASE IF NOT EXISTS `tangoline_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tangoline_db`;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `downloads`;
DROP TABLE IF EXISTS `website_visits`;
DROP TABLE IF EXISTS `login_logs`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `admins`;

CREATE TABLE `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT '',
  `phone` VARCHAR(30) DEFAULT '',
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(80) DEFAULT '',
  `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_username` (`username`),
  INDEX `idx_user_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL UNIQUE,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `brand` VARCHAR(60) NOT NULL DEFAULT 'Gaming',
  `platform` VARCHAR(60) NOT NULL DEFAULT 'PlayStation 5',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `short_description` VARCHAR(255) DEFAULT '',
  `description` TEXT NOT NULL,
  `specifications` TEXT DEFAULT NULL,
  `system_requirements` TEXT DEFAULT NULL,
  `image` VARCHAR(255) NOT NULL DEFAULT '',
  `docx_file` VARCHAR(255) DEFAULT '',
  `stock_status` ENUM('in_stock', 'out_of_stock') NOT NULL DEFAULT 'in_stock',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX `idx_prod_category` (`category_id`),
  INDEX `idx_prod_brand` (`brand`),
  INDEX `idx_prod_slug` (`slug`),
  INDEX `idx_prod_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(120) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `postal_code` VARCHAR(20) DEFAULT '',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cash_on_delivery',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Pending', 'Processing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_user` (`user_id`),
  INDEX `idx_order_status` (`status`),
  INDEX `idx_order_num` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(191) NOT NULL,
  `product_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `product_image` VARCHAR(255) DEFAULT '',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  INDEX `idx_item_order` (`order_id`),
  INDEX `idx_item_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `session_id` VARCHAR(128) NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_cart_item` (`session_id`, `product_id`),
  INDEX `idx_cart_session` (`session_id`),
  INDEX `idx_cart_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `downloads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `session_id` VARCHAR(128) DEFAULT '',
  `ip_address` VARCHAR(45) DEFAULT '',
  `file_name` VARCHAR(255) NOT NULL,
  `downloaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_download_product` (`product_id`),
  INDEX `idx_download_user` (`user_id`),
  INDEX `idx_download_date` (`downloaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `website_visits` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(128) NOT NULL,
  `ip_hash` VARCHAR(64) DEFAULT '',
  `page_url` VARCHAR(255) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT '',
  `visit_date` DATE NOT NULL,
  `visited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_visit_date` (`visit_date`),
  INDEX `idx_visit_session_date` (`session_id`, `visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `login_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `account_type` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `identifier` VARCHAR(120) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT '',
  `status` ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  `user_agent` VARCHAR(255) DEFAULT '',
  `login_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_login_user` (`user_id`),
  INDEX `idx_login_type` (`account_type`),
  INDEX `idx_login_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contact_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `subject` VARCHAR(200) NOT NULL DEFAULT '',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_contact_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `full_name`) VALUES
(1, 'admin', 'admin@tangoline.com', '$2y$10$eAOMp8R789p6X3bYm.437.lqBvyE01B8Vlq8Qv9O9Esh8w9Jq3Zp6', 'Tangoline Administrator');

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `address`, `city`, `status`) VALUES
(1, 'gamer', 'gamer@tangoline.com', '$2y$10$eAOMp8R789p6X3bYm.437.lqBvyE01B8Vlq8Qv9O9Esh8w9Jq3Zp6', 'Pro Gamer', '+92 312 3456789', 'Saima Tower, I.I Chundrigar Rd', 'Karachi', 'active');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`) VALUES
(1, 'Games', 'games', 'Authentic physical discs and blockbuster digital editions across PlayStation, Xbox, and Nintendo Switch.', 'game.png'),
(2, 'Consoles', 'consoles', 'Next-generation gaming consoles, pro wireless controllers, and authentic gaming hardware with warranty.', 'images/console-hub.jpg'),
(3, 'PC Parts', 'pc-parts', 'High-performance PC components, processors, graphics cards, motherboards, high-speed RAM, fast NVMe SSDs, modular PSUs, cases, and cooling systems.', 'images/pc-hub.png');

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `brand`, `platform`, `price`, `original_price`, `short_description`, `description`, `specifications`, `system_requirements`, `image`, `docx_file`, `stock_status`, `is_featured`, `views_count`) VALUES
(1, 1, 'Call of Duty Black Ops 6 Xbox series X, Xbox one', 'call-of-duty-black-ops-6-xbox-series-x-xbox-one', 'Xbox', 'Xbox Series X', 17000.00, 19500.00, 'Spy action thriller set in the early 90s with cinematic campaign, multiplayer, and round-based Zombies.', 'Developed by Treyarch and Raven, Call of Duty: Black Ops 6 is a spy action thriller set in the early 90s, a period of transition and upheaval in global politics. Features dynamic campaign, signature multiplayer, and round-based Zombies with next-gen graphics.', 'Platform: Xbox Series X/S, Xbox One\nDeveloper: Treyarch / Raven Software\nPublisher: Activision\nGenre: First-Person Shooter\nAudio: Dolby Atmos, DTS:X\nHDR: HDR10 Enabled', 'Storage: 128 GB required\nNetwork: High-speed internet required for multiplayer\nSubscription: Xbox Game Pass Core or Ultimate required for online play', 'uploads/products/cod-black-ops-6.png', 'fc/cod ops.docx', 'in_stock', 1, 142),
(2, 1, 'EA SPORTS FC 25 XBOX ONE, SERIES X', 'ea-sports-fc-25-xbox-one-series-x', 'Xbox', 'Xbox Series X', 15000.00, 16500.00, 'Experience more ways to win with 5v5 Rush, FC IQ tactical overhaul, and authentic clubs.', 'Experience more ways to win for the club in EA SPORTS FC 25. Team up with friends in 5v5 Rush, manage your club to victory with FC IQ tactical control, and play with authentic football legends across world-renowned stadiums.', 'Platform: Xbox Series X/S, Xbox One\nDeveloper: EA Vancouver / EA Romania\nPublisher: Electronic Arts\nGenre: Sports Football Simulation\nPlayer Count: 1-4 Local, 2-22 Online', 'Storage: 65 GB required\nNetwork: Online connection required for Ultimate Team and Rush', 'uploads/products/fc-25-xbox.png', 'fc/soccergame.docx', 'in_stock', 0, 98),
(3, 1, 'TEKKEN 8 XBOX ONE SERIES X', 'tekken-8-xbox-one-series-x', 'Xbox', 'Xbox Series X', 14300.00, 16000.00, 'Fist Meets Fate in TEKKEN 8. Unreal Engine 5 combat with aggressive Heat System.', 'Fist Meets Fate in TEKKEN 8. Powered by Unreal Engine 5, experience high-impact martial arts combat, breathtaking character models, aggressive Heat System mechanics, and legendary rivalries continuing the longest-running video game storyline.', 'Platform: Xbox Series X/S\nDeveloper: Bandai Namco Studios\nPublisher: Bandai Namco Entertainment\nEngine: Unreal Engine 5\nModes: Arcade Quest, Story Mode, Online Ranked', 'Storage: 100 GB required\nDisplay: 4K 60FPS recommended for competitive response times', 'uploads/products/tekken-8.jpg', 'fc/tekken8.docx', 'in_stock', 1, 165),
(4, 1, 'Until Dawn Playstation 5', 'until-dawn-playstation-5', 'PlayStation', 'PlayStation 5', 15500.00, 17000.00, 'Horror classic rebuilt from the ground up for PS5 with enhanced lighting and DualSense feedback.', 'Face your fears and determine who survives in this enhanced version of the horror classic. Rebuilt from the ground up for PlayStation 5 with stunning visuals, enhanced lighting, and immersive DualSense haptic feedback in the freezing Blackwood Mountain.', 'Platform: PlayStation 5\nDeveloper: Ballistic Moon / Supermassive Games\nPublisher: Sony Interactive Entertainment\nEngine: Unreal Engine 5\nFeatures: Full DualSense Haptics and Adaptive Triggers', 'Storage: 70 GB SSD required\nAudio: Tempest 3D AudioTech compatible', 'uploads/products/until-dawn.png', 'fc/skull.docx', 'in_stock', 0, 84),
(5, 1, 'Silent Hill 2 Remake Playstation 5', 'silent-hill-2-remake-playstation-5', 'PlayStation', 'PlayStation 5', 15500.00, 17500.00, 'Psychological survival horror masterpiece reimagined with Unreal Engine 5 on PS5.', 'Having received a letter from his deceased wife, James heads to where they shared so many memories in Silent Hill. Experience the critically acclaimed psychological survival horror masterpiece reimagined for PS5 with atmospheric fog, modern over-the-shoulder camera, and 3D soundscapes.', 'Platform: PlayStation 5\nDeveloper: Bloober Team\nPublisher: Konami\nGenre: Psychological Survival Horror\nDisplay: Quality (30fps 4K) / Performance (60fps dynamic 4K)', 'Storage: 50 GB high-speed PS5 SSD space\nAudio: 3D Audio headphones recommended', 'uploads/products/silent-hill-2.png', 'fc/silent hill.docx', 'in_stock', 1, 210),
(6, 1, 'Star Wars Outlaws Playstation 5', 'star-wars-outlaws-playstation-5', 'PlayStation', 'PlayStation 5', 14500.00, 16000.00, 'First-ever open-world Star Wars adventure set between Empire Strikes Back and Return of the Jedi.', 'Experience the first-ever open-world Star Wars game, set between The Empire Strikes Back and Return of the Jedi. Explore distinct planets across the galaxy, steal, fight, and outwit criminal syndicates as scoundrel Kay Vess alongside companion Nix.', 'Platform: PlayStation 5\nDeveloper: Massive Entertainment\nPublisher: Ubisoft\nGenre: Open-World Action Adventure\nFeatures: Seamless space travel, speeder combat, ray tracing', 'Storage: 85 GB SSD space\nNetwork: Internet connection required for day-one update', 'uploads/products/star-wars-outlaws.png', 'fc/stars war.docx', 'in_stock', 0, 112),
(7, 1, 'Tomb Raider I-III Remastered Nintendo Switch', 'tomb-raider-i-iii-remastered-nintendo-switch', 'Nintendo Switch', 'Nintendo Switch', 9500.00, 11000.00, 'Lara Croft original three adventures restored with enhanced graphics and modern controls.', 'Discover Lara Croft\'s Original Adventures, Lovingly Restored. Play the Original Three Tomb Raider Adventures with all expansions and secret levels on Nintendo Switch with upgraded 3D visuals or classic nostalgic polygon toggle.', 'Platform: Nintendo Switch (OLED, Standard, Lite)\nDeveloper: Aspyr Media / Crystal Dynamics\nPublisher: Aspyr\nGenre: Action Adventure Puzzle Platformer\nLanguages: English, Japanese, French, German, Spanish', 'Storage: 6.8 GB space\nSupported Play Modes: TV mode, Tabletop mode, Handheld mode', 'uploads/products/tomb-raider.png', 'fc/tomb.docx', 'in_stock', 0, 76),
(8, 1, 'Mario & Luigi Brothership Nintendo Switch', 'mario-luigi-brothership-nintendo-switch', 'Nintendo Switch', 'Nintendo Switch', 12500.00, 14000.00, 'All-new seafaring island RPG adventure across Concordia featuring dynamic brother-moves.', 'All hands on deck for an island-hopping adventure starring Mario and Luigi! The brothers return for an all-new seafaring RPG adventure across Concordia featuring dynamic brother-moves, colorful characters, and turn-based combat.', 'Platform: Nintendo Switch\nDeveloper: Nintendo\nPublisher: Nintendo\nGenre: Turn-Based Role-Playing (RPG)\nPlayer Count: 1 Player', 'Storage: 10 GB space\nSave Data Cloud: Supported', 'uploads/products/mario-luigi-brothership.png', 'fc/mario.docx', 'in_stock', 0, 134),
(9, 1, 'EA SPORTS FC 25 N SWITCH', 'ea-sports-fc-25-n-switch', 'Nintendo Switch', 'Nintendo Switch', 15500.00, 16500.00, 'Authentic football simulation on Nintendo Switch with Frostbite engine and 5v5 Rush.', 'Experience authentic football action on Nintendo Switch with EA SPORTS FC 25. Team up with friends in 5v5 Rush, manage your club, and enjoy comprehensive career and online gameplay anywhere in handheld or dock mode.', 'Platform: Nintendo Switch\nDeveloper: EA Vancouver\nPublisher: Electronic Arts\nEngine: Frostbite Engine for Switch\nResolution: 1080p Docked, 720p Handheld at 30fps', 'Storage: 31 GB required (MicroSD card recommended)\nOnline Membership: Nintendo Switch Online required for multiplayer', 'uploads/products/fc-25-switch.png', 'fc/fc nin.docx', 'in_stock', 0, 89),
(10, 2, 'Sony PlayStation 5 Pro Console White', 'sony-playstation-5-pro-console-white', 'PlayStation', 'PlayStation 5', 329999.00, 345000.00, 'Next-generation flagship PS5 Pro with PSSR AI-upscaling, Advanced Ray Tracing, and 2TB SSD.', 'PlayStation Spectral Super Resolution (PSSR). Get super sharp image clarity on your 4K TV with AI-enhanced resolution for ultra-high-definition play with astonishing detail. Features advanced ray tracing, 2TB SSD, and 120 FPS support for elite gameplay performance.', 'Processor: Custom AMD Zen 2, 8 cores / 16 threads\nGPU: Custom RDNA architecture with 67% more compute units\nMemory: 16GB GDDR6 + 2GB DDR5\nStorage: 2TB Custom High-Speed NVMe SSD\nVideo Output: Supports 4K 120Hz TVs, 8K TVs, VRR', 'Power Supply: AC 100-240V, 50/60Hz\nConnectivity: Wi-Fi 7, Bluetooth 5.1, HDMI 2.1, 2x USB-C, 2x USB-A\nIncluded: DualSense Wireless Controller, 2TB Console, HDMI cable, AC cord', 'uploads/products/ps5-pro-console.png', 'fc/Ps5 console.docx', 'in_stock', 1, 380),
(11, 2, 'PlayStation 5 Slim Digital Edition 1TB', 'playstation-5-slim-digital-edition-1tb', 'PlayStation', 'PlayStation 5', 158000.00, 170000.00, 'Slimmer, lighter PS5 with 1TB SSD storage, ray tracing, and ultra-high speed I/O.', 'The new PS5 Slim has been reduced in volume by more than 30%, and weight by 18% to 24%. Packed with 1TB SSD storage, ultra-high speed I/O, Ray Tracing, and immersive 3D Audio in a sleek modular design.', 'Dimensions: Approx. 358 × 80 × 216 mm\nWeight: Approx. 2.6 kg\nStorage: 1TB Ultra-High Speed NVMe SSD\nAudio: Tempest 3D AudioTech\nHaptics: DualSense Haptic Feedback & Adaptive Triggers', 'Networking: Gigabit Ethernet, Wi-Fi 6 (802.11ax), Bluetooth 5.1\nDisc Drive: Compatible with detachable Ultra HD Blu-ray Disc Drive (sold separately)', 'uploads/products/ps5-slim-console.png', 'fc/PS5 SLIM console.docx', 'in_stock', 0, 195),
(12, 2, 'Sony PlayStation Controller with Soft Protection Case', 'sony-playstation-controller-with-soft-protection-case', 'PlayStation', 'PlayStation', 16000.00, 18500.00, 'DualSense wireless controller bundled with ergonomic silicone anti-slip protective case.', 'The wireless controller is powered by a high capacity rechargeable lithium-ion battery. Comes bundled with an ergonomic non-slip soft silicone protective case and precision thumb grips for maximum comfort during intense gaming sessions.', 'Compatibility: PlayStation 5, PC (Windows), macOS, iOS, Android\nBattery: Built-in rechargeable Lithium-ion 1560mAh\nSensors: Six-axis motion sensing system (3-axis gyroscope + 3-axis accelerometer)\nPort: USB Type-C charging and data', 'Case Material: Medical-grade soft silicone with sweat-resistant texture\nWeight: 280g', 'uploads/products/ps-controller.jpeg', 'fc/PS5 CONTROLER.docx', 'in_stock', 0, 140),
(13, 2, 'Xbox Series X 1TB Console', 'xbox-series-x-1tb-console', 'Xbox', 'Xbox Series X', 167000.00, 180000.00, 'The fastest, most powerful Xbox ever with 12 teraflops, 4K at 120 FPS, and 1TB Custom SSD.', 'Introducing Xbox Series X, the fastest, most powerful Xbox ever. Play thousands of titles from four generations of consoles with 12 teraflops of raw graphic processing power, 4K gaming at up to 120 FPS, and 1TB Custom NVMe SSD with Quick Resume.', 'CPU: 8X Cores @ 3.8 GHz (3.66 GHz w/ SMT) Custom Zen 2 CPU\nGPU: 12 TFLOPS, 52 CUs @ 1.825 GHz Custom RDNA 2 GPU\nMemory: 16GB GDDR6 w/ 320-bit bus\nInternal Storage: 1TB Custom NVMe SSD\nOptical Drive: 4K UHD Blu-Ray', 'Gaming Resolution: True 4K\nTarget Performance: Up to 120 FPS\nDolby Support: Dolby Vision and Dolby Atmos\nPorts: 1x HDMI 2.1, 3x USB 3.1 Gen 1, Storage Expansion Port', 'uploads/products/xbox-series-x-console.png', 'fc/X BOX 1.docx', 'in_stock', 1, 290),
(14, 2, 'Microsoft Xbox One X Used (Certified Refurbished)', 'microsoft-xbox-one-x-used-certified-refurbished', 'Xbox', 'Xbox One X', 65000.00, 75000.00, 'Certified refurbished Xbox One X with 6 teraflops of true 4K graphical power and 1TB storage.', 'Certified refurbished Microsoft Xbox One X. Experience true 4K gaming with 6 teraflops of graphical power, 4K Blu-ray player, HDR10 support, and complete backward compatibility with full warranty and official inspection certificate.', 'Processor: 8-core Custom AMD CPU clocked at 2.3GHz\nGPU: 6 TFLOPS, 40 compute units at 1172MHz\nMemory: 12GB GDDR5 graphic memory\nStorage: 1TB HDD\nDisc Drive: 4K UHD Blu-ray', 'Condition: Grade-A Certified Refurbished with 6 Months Store Warranty\nAccessories: Wireless controller, High-Speed HDMI cable, Power cord', 'uploads/products/xbox-one-x.png', 'fc/X BOX 2.docx', 'in_stock', 0, 110),
(15, 2, 'Microsoft Xbox One S Used (Certified Refurbished)', 'microsoft-xbox-one-s-used-certified-refurbished', 'Xbox', 'Xbox One S', 55000.00, 62000.00, 'Certified refurbished compact Xbox One S featuring 4K Ultra HD video streaming and HDR.', 'Certified refurbished Xbox One S. Sleek, compact console featuring 4K Ultra HD video streaming, High Dynamic Range (HDR) gaming, and backward compatibility across Xbox classic libraries with certified multi-point inspection.', 'Dimensions: 295 x 230 x 64 mm\nStorage: 500GB / 1TB HDD storage options\nVideo: 4K Ultra HD video playback and HDR10 support\nPower Supply: Internal power supply', 'Condition: Grade-A Tested with 6 Months Store Warranty\nPackage: Xbox One S Console, Wireless Controller, HDMI, Power Cord', 'uploads/products/xbox-one-s.png', 'fc/X BOX 3.docx', 'in_stock', 0, 95),
(16, 2, 'Nintendo Switch OLED Model Mario Red Edition', 'nintendo-switch-oled-model-mario-red-edition', 'Nintendo Switch', 'Nintendo Switch', 86000.00, 92000.00, 'Mario-inspired console with 7-inch OLED screen, wide adjustable stand, and LAN dock.', 'Start your adventure with a Mario-inspired system. Warp into a world of games with the Nintendo Switch - OLED Model Mario Red Edition featuring a vibrant 7-inch OLED screen, wide adjustable stand, LAN dock, and hidden Mario silhouettes and coins.', 'Screen: Multi-touch capacitive touch screen / 7.0 inch OLED screen / 1280x720\nStorage: 64 GB internal storage (expandable via microSD)\nAudio: Enhanced audio from onboard speakers\nDock: Features built-in wired LAN port', 'Battery Life: Approx. 4.5 to 9.0 hours depending on game\nCharging Time: Approx. 3 hours\nIncluded: Joy-Con (L)/(R) Mario Red, Joy-Con Straps, Joy-Con Grip, Dock, AC Adapter, HDMI Cable', 'uploads/products/nintendo-switch-mario-red.png', 'fc/NINTENDO 1.docx', 'in_stock', 1, 230),
(17, 2, 'Nintendo Switch OLED Model Zelda Edition', 'nintendo-switch-oled-model-the-legend-of-zelda-tears-of-the-kingdom-edition', 'Nintendo Switch', 'Nintendo Switch', 90000.00, 98000.00, 'Special Zelda Tears of the Kingdom design with Hylian Crest dock and custom gold Joy-Cons.', 'The Nintendo Switch OLED Model The Legend of Zelda: Tears of the Kingdom Edition features a special design from the game, including the iconic Hylian Crest on the dock and custom gold Joy-Cons with intricate Zonai runes.', 'Screen: 7.0 inch OLED capacitive touchscreen\nStorage: 64 GB storage (MicroSDXC compatible up to 2TB)\nSpecial Features: Custom Zelda backplate motif, Gold Joy-Cons, White and Gold embellished dock', 'Connectivity: Wi-Fi (802.11 a/b/g/n/ac), Bluetooth 4.1, Wired LAN port on dock\nWeight: Approx. 420g with Joy-Cons attached', 'uploads/products/nintendo-switch-zelda.png', 'fc/NINTENDO 2.docx', 'in_stock', 0, 175),
(18, 2, 'Nintendo Switch Pro Controller Splatoon 3 Edition', 'nintendo-switch-pro-controller-splatoon-3-special-edition', 'Nintendo Switch', 'Nintendo Switch', 18500.00, 21000.00, 'Ergonomic pro controller with motion controls, HD rumble, built-in amiibo, and Splatoon 3 styling.', 'Take your game sessions up a notch with the Pro Controller for Nintendo Switch. Includes motion controls, HD rumble, built-in amiibo functionality, premium grips, and striking Splatoon 3 styling with neon yellow and blue grip accents.', 'Connectivity: Bluetooth 3.0, NFC (Near-Field Communication for amiibo)\nSensors: Accelerometer, Gyroscope\nVibration: HD rumble\nBattery: Lithium-ion battery (approx. 40 hours playtime)\nCharging: USB Type-C', 'Compatibility: Nintendo Switch, Nintendo Switch - OLED Model, Nintendo Switch Lite (as wireless controller)\nWeight: Approx. 246g', 'uploads/products/nintendo-switch-pro-controller.png', 'fc/NINTENDO 3.docx', 'in_stock', 0, 120),
(19, 3, 'AMD Ryzen 7 7800X3D Gaming Processor', 'amd-ryzen-7-7800x3d-gaming-processor', 'AMD', 'PC / AM5', 118000.00, 129000.00, 'The world''s undisputed ultimate gaming processor featuring 8 cores, 16 threads, and 96MB 3D V-Cache technology.', 'The AMD Ryzen 7 7800X3D is the pinnacle of PC gaming CPU performance. Built on the revolutionary 5nm Zen 4 architecture with second-generation AMD 3D V-Cache technology, delivering monumental frame rate gains and ultra-smooth 1% lows in modern AAA competitive titles.', 'Architecture: Zen 4\nCores / Threads: 8 Cores / 16 Threads\nBase / Boost Clock: 4.2 GHz / 5.0 GHz\nL3 Cache: 96MB AMD 3D V-Cache\nSocket: AM5\nTDP: 120W\nPCIe Version: PCIe 5.0\nMemory Support: DDR5 up to 5200 MT/s', 'Motherboard: AMD Socket AM5 (X670E, B650, A620)\nCooler: 240mm Liquid AIO or high-performance dual tower air cooler\nMemory: DDR5 Dual-Channel RAM\nPower Supply: 650W minimum recommended', 'images/pc-cpu.jpg', 'fc/amd-ryzen-7-7800x3d-gaming-processor-details.docx', 'in_stock', 1, 310),
(20, 3, 'Intel Core i9-14900K Flagship Desktop Processor', 'intel-core-i9-14900k-flagship-desktop-processor', 'Intel', 'PC / LGA1700', 165000.00, 180000.00, '24-core flagship desktop beast reaching up to 6.0 GHz Thermal Velocity Boost for elite gaming and content creation.', 'Experience uncompromising performance with Intel Core i9-14900K. Engineered with 24 cores (8 Performance cores + 16 Efficient cores) and 32 threads, unlocking 6.0 GHz factory clocks. Ready to crush 4K gaming, 3D rendering, and heavy multitasking.', 'Architecture: Raptor Lake Refresh\nCores: 24 (8 P-cores + 16 E-cores)\nThreads: 32\nMax Boost Frequency: 6.0 GHz\nIntel Smart Cache: 36MB\nBase / Turbo Power: 125W / 253W\nSocket: LGA1700\nMemory: DDR5-5600 / DDR4-3200', 'Motherboard: Intel Z790 or Z690 chipset (BIOS update may be required)\nCooler: 360mm Liquid AIO Cooler strongly recommended\nPower Supply: 850W+ ATX 3.0 power supply', 'images/pc-cpu-intel.jpg', 'fc/intel-core-i9-14900k-flagship-desktop-processor-details.docx', 'in_stock', 1, 275),
(21, 3, 'AMD Ryzen 5 7600X Desktop Processor', 'amd-ryzen-5-7600x-desktop-processor', 'AMD', 'PC / AM5', 58000.00, 66000.00, 'High-speed 6-core 12-thread Zen 4 powerhouse CPU offering unmatched value for esports and AAA gaming.', 'The AMD Ryzen 5 7600X is designed for gamers who crave pure performance without breaking the bank. Features 6 ultra-fast Zen 4 cores clocking up to 5.3 GHz, PCIe 5.0 support, and dedicated AMD EXPO memory profiles.', 'Cores / Threads: 6 Cores / 12 Threads\nBase / Boost Clock: 4.7 GHz / 5.3 GHz\nL3 Cache: 32MB (38MB Total Cache)\nSocket: AM5\nTDP: 105W\nProcess: TSMC 5nm FinFET', 'Motherboard: AMD Socket AM5 (B650 / A620)\nMemory: DDR5 RAM required\nCooling: Aftermarket tower cooler or 120/240mm AIO\nPower: 550W+ PSU', 'images/pc-cpu-ryzen5.jpg', 'fc/amd-ryzen-5-7600x-desktop-processor-details.docx', 'in_stock', 0, 185),
(22, 3, 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB', 'asus-rog-strix-geforce-rtx-4090-oc-edition-24gb', 'ASUS', 'PC / PCIe 4.0', 615000.00, 650000.00, 'The undisputed king of graphics cards with 24GB GDDR6X, Ada Lovelace architecture, and DLSS 3 Frame Generation.', 'The ASUS ROG Strix GeForce RTX 4090 OC Edition sets a new benchmark in ultra-enthusiast graphics power. Powered by NVIDIA Ada Lovelace, 16,384 CUDA cores, 3rd gen RT cores, and 4th gen Tensor cores. Built with a patented vapor chamber and diecast exoskeleton for frosty temperatures.', 'Graphics Engine: NVIDIA GeForce RTX 4090\nVideo Memory: 24GB GDDR6X\nBus Standard: PCIe 4.0 x16\nEngine Clock: 2640 MHz (OC Mode) / 2610 MHz (Default)\nCUDA Cores: 16384\nMemory Speed: 21 Gbps\nDimensions: 357.6 x 149.3 x 70.1 mm (3.5 slot)\nOutputs: 2x HDMI 2.1a, 3x DisplayPort 1.4a', 'Power Supply: 1000W minimum (16-pin 12VHPWR connector required)\nExpansion Slots: 3.5 Slot clearance\nCase Length: 360mm+ interior GPU space required', 'images/pc-gpu.jpg', 'fc/asus-rog-strix-geforce-rtx-4090-oc-edition-24gb-details.docx', 'in_stock', 1, 490),
(23, 3, 'MSI Gaming X Slim GeForce RTX 4070 Ti SUPER 16GB', 'msi-gaming-x-slim-geforce-rtx-4070-ti-super-16gb', 'MSI', 'PC / PCIe 4.0', 255000.00, 275000.00, 'High-framerate 1440p and 4K powerhouse GPU with 16GB GDDR6X, TORX FAN 5.0, and slim profile aesthetics.', 'The MSI GeForce RTX 4070 Ti SUPER 16G GAMING X SLIM delivers outstanding performance for modern gamers and creators. Equipped with 16GB GDDR6X on a 256-bit bus, TRI FROZR 3 cooling, and full NVIDIA DLSS 3.5 Ray Reconstruction.', 'GPU: NVIDIA GeForce RTX 4070 Ti SUPER\nCUDA Cores: 8448\nBoost Clock: 2685 MHz (Extreme Performance)\nMemory: 16GB GDDR6X (256-bit)\nInterface: PCIe Gen 4 x16\nDisplay Outputs: 3x DisplayPort 1.4a, 1x HDMI 2.1a', 'Power Requirement: 750W recommended\nPower Cable: 1x 16-pin 12VHPWR (adapter included)\nSlot Width: 2.5 Slots (307 x 125 x 51 mm)', 'images/pc-gpu-msi.jpg', 'fc/msi-gaming-x-slim-geforce-rtx-4070-ti-super-16gb-details.docx', 'in_stock', 0, 215),
(24, 3, 'Sapphire NITRO+ AMD Radeon RX 7900 XTX 24GB', 'sapphire-nitro-amd-radeon-rx-7900-xtx-24gb', 'Sapphire', 'PC / PCIe 4.0', 310000.00, 335000.00, 'Flagship RDNA 3 gaming graphics card with 24GB high-speed memory, Vapor-X chamber, and Dual ARGB light bars.', 'The SAPPHIRE NITRO+ AMD Radeon RX 7900 XTX Vapor-X represents the apex of AMD RDNA 3 engineering. Featuring 24GB of dedicated VRAM, DisplayPort 2.1 support for next-gen 8K monitors, and an iconic aluminum-magnesium alloy frame with dual ARGB halos.', 'GPU: AMD Radeon RX 7900 XTX\nStream Processors: 6144\nBoost Clock: Up to 2680 MHz\nGame Clock: Up to 2510 MHz\nMemory Size: 24GB GDDR6 (384-bit)\nInfinity Cache: 96MB\nPorts: 2x HDMI 2.1a, 2x DisplayPort 2.1', 'Power Supply: 800W minimum\nPower Connectors: 3x 8-pin PCIe\nDimensions: 320 x 135.75 x 71.6 mm (3.5 slot)', 'images/pc-gpu-sapphire.jpg', 'fc/sapphire-nitro-amd-radeon-rx-7900-xtx-24gb-details.docx', 'in_stock', 1, 240),
(25, 3, 'Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB', 'gigabyte-geforce-rtx-4060-ti-gaming-oc-8gb', 'Gigabyte', 'PC / PCIe 4.0', 135000.00, 148000.00, 'The ultimate 1080p and 1440p gaming card with WINDFORCE triple-fan cooling and RGB Fusion lighting.', 'Step into next-gen ray tracing with the GIGABYTE GeForce RTX 4060 Ti GAMING OC. Built with WINDFORCE cooling system featuring three 80mm unique blade fans, alternate spinning, composite copper heat pipes, and full Ada Lovelace DLSS 3 support.', 'GPU: GeForce RTX 4060 Ti\nCUDA Cores: 4352\nCore Clock: 2580 MHz (Factory Overclocked)\nMemory: 8GB GDDR6 (128-bit)\nOutputs: 2x DisplayPort 1.4a, 2x HDMI 2.1a\nCard Dimensions: 281 x 117 x 53 mm', 'Power Supply: 500W minimum\nPower Connector: 1x 8-pin PCIe\nCase Clearance: 285mm', 'images/pc-gpu-gigabyte.jpg', 'fc/gigabyte-geforce-rtx-4060-ti-gaming-oc-8gb-details.docx', 'in_stock', 0, 160),
(26, 3, 'ASUS ROG Maximus Z790 Dark Hero Motherboard', 'asus-rog-maximus-z790-dark-hero-motherboard', 'ASUS', 'PC / Intel Z790', 215000.00, 235000.00, 'Premium Intel Z790 motherboard with 20+1+2 power stages, Wi-Fi 7, Dual Thunderbolt 4, and PCIe 5.0 M.2 slot.', 'The ROG Maximus Z790 Dark Hero delivers state-of-the-art power delivery, hyper-fast Wi-Fi 7, and robust heatsinks for extreme Intel 14th Gen overclocking. Features Polymo Lighting, SupremeFX ALC4082 audio, and five onboard M.2 slots.', 'Form Factor: ATX\nSocket: LGA1700\nChipset: Intel Z790\nMemory: 4x DDR5 DIMM slots up to 192GB (8000+ MHz OC)\nExpansion: 2x PCIe 5.0 x16 SafeSlots\nM.2 Storage: 5x M.2 (1x PCIe 5.0, 4x PCIe 4.0)\nNetwork: Intel 2.5Gb Ethernet, Wi-Fi 7 (802.11be), Bluetooth 5.4', 'Case: ATX mid-tower or full-tower chassis\nPower Supply: 24-pin ATX + dual 8-pin EPS 12V connectors\nProcessor: Intel Core 14th, 13th, or 12th Gen', 'images/pc-mobo.jpg', 'fc/asus-rog-maximus-z790-dark-hero-motherboard-details.docx', 'in_stock', 1, 195),
(27, 3, 'MSI MAG B650 TOMAHAWK WIFI ATX Motherboard', 'msi-mag-b650-tomahawk-wifi-atx-motherboard', 'MSI', 'PC / AMD AM5', 68000.00, 76000.00, 'Military-grade AM5 motherboard with 14+2+1 Duet Rail power, Wi-Fi 6E, 2.5G LAN, and lightning Gen 4 M.2.', 'MSI MAG B650 TOMAHAWK WIFI is built for rock-solid stability and gaming dominance on AMD Ryzen 7000 and 8000 series CPUs. Equipped with extended heatsink design, M.2 Shield Frozr, and DDR5 Memory Boost.', 'Socket: AMD AM5\nChipset: AMD B650\nMemory: 4x DDR5 Dual Channel up to 128GB (6600+ MHz OC)\nM.2 Slots: 3x PCIe 4.0 x4 M.2 slots with heatsinks\nNetworking: Realtek 2.5Gbps LAN + AMD Wi-Fi 6E\nAudio: Realtek ALC4080 7.1 HD Audio', 'Processor: AMD Socket AM5 Ryzen CPU\nRAM: DDR5 Memory\nForm Factor: Standard ATX (304.8 x 243.8 mm)', 'images/pc-mobo-msi.jpg', 'fc/msi-mag-b650-tomahawk-wifi-atx-motherboard-details.docx', 'in_stock', 0, 170),
(28, 3, 'Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz CL30', 'corsair-vengeance-rgb-ddr5-32gb-2x16gb-6000mhz-cl30', 'Corsair', 'PC / DDR5', 38500.00, 44000.00, 'Ultra-low latency CL30 gaming memory kit optimized for AMD EXPO & Intel XMP with vibrant ten-zone RGB lighting.', 'Push the boundaries of your system with Corsair Vengeance RGB DDR5 32GB. Tuned to the sweet spot of 6000MHz at tight CL30 latencies, ensuring maximum gaming responsiveness, higher framerates, and customizable iCUE RGB lighting.', 'Memory Type: DDR5\nCapacity: 32GB (2 x 16GB Kit)\nTested Speed: 6000 MT/s\nTested Latency: 30-36-36-76\nTested Voltage: 1.40V\nProfiles: AMD EXPO & Intel XMP 3.0\nLighting: Dynamic Ten-Zone Addressable RGB', 'Motherboard: DDR5 Motherboard (Intel 600/700 or AMD 600 series)\nOperating System: Windows 10/11 for Corsair iCUE software', 'images/pc-ram.jpg', 'fc/corsair-vengeance-rgb-ddr5-32gb-2x16gb-6000mhz-cl30-details.docx', 'in_stock', 1, 230),
(29, 3, 'G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz', 'gskill-trident-z5-rgb-64gb-2x32gb-ddr5-6400mhz', 'G.Skill', 'PC / DDR5', 69000.00, 78000.00, 'High-capacity, blazing-fast 64GB dual-channel memory kit with sleek aluminum heatspreader and streamlined light bar.', 'Trident Z5 RGB series is designed for ultra-high performance on next-gen DDR5 platforms. Featuring a hyper-clean metallic silver and matte black heatspreader with smooth RGB illumination, ideal for hardcore gaming, video editing, and heavy workloads.', 'Series: Trident Z5 RGB\nCapacity: 64GB (2 x 32GB)\nSpeed: DDR5-6400 (PC5-51200)\nCAS Latency: CL32 (32-39-39-102)\nVoltage: 1.40V\nOverclock Profile: Intel XMP 3.0 Ready', 'Platform: Intel Z790/Z690 or AMD AM5 platform supporting DDR5 6400MHz', 'images/pc-ram-gskill.jpg', 'fc/gskill-trident-z5-rgb-64gb-2x32gb-ddr5-6400mhz-details.docx', 'in_stock', 0, 145),
(30, 3, 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD with Heatsink', 'samsung-990-pro-2tb-pcie-4-0-nvme-m-2-ssd-with-heatsink', 'Samsung', 'PC / PS5', 62000.00, 70000.00, 'Flagship PCIe 4.0 SSD reaching up to 7450 MB/s read speeds with integrated slim RGB heatsink for zero thermal throttling.', 'Reach near-maximum PCIe 4.0 speeds with the Samsung 990 PRO 2TB NVMe SSD. Reaching blazing read speeds up to 7450 MB/s and write speeds up to 6900 MB/s, slashing game load times to near zero. Built-in heatsink keeps temperature in check and is fully compatible with both PC and PlayStation 5.', 'Form Factor: M.2 2280 (with heatsink)\nInterface: PCIe Gen 4.0 x4, NVMe 2.0\nSequential Read: Up to 7450 MB/s\nSequential Write: Up to 6900 MB/s\nRandom Read/Write: Up to 1,600,000 IOPS\nEndurance: 1200 TBW\nDimensions: 80 x 24.3 x 8.2 mm', 'Slot: M.2 (Key M) slot with PCIe 4.0 support\nCompatible: PC, Laptops with clearance, PlayStation 5', 'images/pc-ssd.jpg', 'fc/samsung-990-pro-2tb-pcie-4-0-nvme-m-2-ssd-with-heatsink-details.docx', 'in_stock', 1, 280),
(31, 3, 'Kingston KC3000 1TB PCIe 4.0 NVMe M.2 SSD', 'kingston-kc3000-1tb-pcie-4-0-nvme-m-2-ssd', 'Kingston', 'PC / PCIe 4.0', 29500.00, 34000.00, 'Top-tier Phison E18 driven PCIe 4.0 SSD delivering 7000 MB/s speeds with low profile graphene aluminum heat spreader.', 'Kingston KC3000 delivers elite performance using the latest Gen 4x4 NVMe controller and 3D TLC NAND. Boot up, launch heavy games, and transfer 4K video files in seconds with industry-leading reliability.', 'Form Factor: M.2 2280\nInterface: PCIe 4.0 NVMe\nCapacity: 1024GB (1TB)\nController: Phison E18\nSequential Read / Write: 7000 MB/s / 6000 MB/s\nEndurance: 800 TBW\nHeatspreader: Graphene Aluminum', 'Slot: M.2 2280 slot (PCIe Gen 4 recommended, PCIe 3.0 backward compatible)', 'images/pc-ssd-kingston.jpg', 'fc/kingston-kc3000-1tb-pcie-4-0-nvme-m-2-ssd-details.docx', 'in_stock', 0, 160),
(32, 3, 'Corsair RM1000x 1000W 80 PLUS Gold Fully Modular ATX 3.0', 'corsair-rm1000x-1000w-80-plus-gold-fully-modular-atx-3-0', 'Corsair', 'PC / ATX', 58000.00, 65000.00, '1000 Watt ultra-quiet power supply with 80 PLUS Gold efficiency, 100% Japanese 105C capacitors, and native PCIe 5.0 12VHPWR.', 'Corsair RM1000x Series fully modular power supplies deliver clean, consistent 80 PLUS Gold efficient power to your flagship gaming rig. Tuned with a 135mm magnetic levitation fan for near-silent operation and zero RPM fan mode at low loads.', 'Total Power: 1000 Watts\nEfficiency Rating: 80 PLUS Gold\nModular Type: Fully Modular\nATX Standard: ATX 3.0 / PCIe 5.0 Compliant\nFan: 135mm Magnetic Levitation Fan\nCapacitors: 100% Japanese 105C Electrolytic\nDimensions: 180 x 150 x 86 mm', 'Chassis: ATX chassis with at least 180mm PSU bay clearance\nInput: 100-240V AC universal', 'images/pc-psu-corsair.jpg', 'fc/corsair-rm1000x-1000w-80-plus-gold-fully-modular-atx-3-0-details.docx', 'in_stock', 0, 190),
(33, 3, 'Seasonic Focus GX-850 850W 80+ Gold Fully Modular PSU', 'seasonic-focus-gx-850-850w-80-gold-fully-modular-psu', 'Seasonic', 'PC / ATX', 44000.00, 49500.00, 'Legendary compact 850W power supply with tight voltage regulation, fluid dynamic bearing fan, and hybrid silent fan control.', 'The Seasonic FOCUS GX-850 provides rock-steady electrical stability with an extremely compact 140mm footprint. Featuring gold-plated high-current terminals, tight load regulation (under 3%), and a hybrid silent fan switch for whisper-quiet gaming.', 'Power: 850 Watts\nEfficiency: 80 PLUS Gold Certified (up to 90% efficiency)\nModularity: 100% Fully Modular Flat Cables\nFan: 120mm Fluid Dynamic Bearing (FDB)\nFan Control: Seasonic S3FC Hybrid Silent Control Button\nDimensions: 140 x 150 x 86 mm', 'Standard ATX enclosure mounting', 'images/pc-psu-seasonic.jpg', 'fc/seasonic-focus-gx-850-850w-80-gold-fully-modular-psu-details.docx', 'in_stock', 0, 130),
(34, 3, 'Lian Li O11 Dynamic EVO RGB Mid-Tower Gaming Case', 'lian-li-o11-dynamic-evo-rgb-mid-tower-gaming-case', 'Lian Li', 'PC / Case', 52000.00, 59000.00, 'Iconic panoramic dual-chamber chassis featuring dual ARGB strips, reversible layout, and support for up to three 420mm radiators.', 'Lian Li O11 Dynamic EVO RGB elevates the legendary O11 design with stunning wrap-around front and side tempered glass with no pillar obstructers. Enjoy completely reversible configuration, dual diffused L-shaped RGB light bars, and unmatched cooling potential.', 'Dimensions: 478 x 290 x 471 mm\nChassis Type: Dual-Chamber Mid-Tower\nMotherboard Support: E-ATX (under 280mm), ATX, Micro-ATX, Mini-ITX\nRadiator Support: Top/Side/Bottom up to 360mm or 420mm\nGPU Clearance: Up to 455.7 mm\nCPU Cooler Clearance: Up to 167 mm', 'Compatible with standard ATX power supplies and hardware', 'images/pc-case-lianli.jpg', 'fc/lian-li-o11-dynamic-evo-rgb-mid-tower-gaming-case-details.docx', 'in_stock', 1, 340),
(35, 3, 'NZXT H9 Flow Dual-Chamber Mid-Tower ATX Case', 'nzxt-h9-flow-dual-chamber-mid-tower-atx-case', 'NZXT', 'PC / Case', 46000.00, 52000.00, 'Ultra-airflow dual-chamber chassis with seamless glass paneling, high-airflow perforated top, and 4 included 120mm fans.', 'The NZXT H9 Flow features an uninterrupted glass wrap for an unobstructed view of your high-end graphics card and liquid cooling setup. Perforated mesh top and side panels ensure direct fresh air intake to GPU and CPU radiators.', 'Form Factor: Mid-Tower Dual-Chamber\nMaterials: SGCC Steel, Ultra-Clear Tempered Glass\nIncluded Fans: 4x F120Q 120mm Quiet Airflow Fans\nTotal Fan Capacity: Up to 10x 120mm fans\nMax GPU Length: 435 mm\nMax CPU Cooler Height: 165 mm\nDimensions: 495 x 290 x 466 mm', 'Motherboard compatibility: ATX, Micro-ATX, Mini-ITX', 'images/pc-case-nzxt.jpg', 'fc/nzxt-h9-flow-dual-chamber-mid-tower-atx-case-details.docx', 'in_stock', 0, 205),
(36, 3, 'NZXT Kraken Elite 360 RGB AIO Liquid CPU Cooler', 'nzxt-kraken-elite-360-rgb-aio-liquid-cpu-cooler', 'NZXT', 'PC / Cooling', 76000.00, 85000.00, 'Premium 360mm liquid cooler with 2.36 inch wide-angle 60Hz LCD screen for custom GIFs, system temps, and F120 RGB Core fans.', 'The NZXT Kraken Elite 360 RGB combines elite cooling performance with dazzling personalization. The crisp 2.36 inch TFT LCD screen displays live CPU/GPU temperatures, favorite custom GIFs, and images. Powered by an ultra-quiet Asetek 7th gen pump and three high-static pressure F120 RGB fans.', 'Radiator: 394 x 121 x 27 mm Aluminum\nDisplay: 2.36 inch TFT LCD (640 x 640 px, 60Hz, 690 cd/m2)\nPump: Asetek 7th Gen (800 - 2800 RPM)\nFans: 3x F120 RGB Core Fans (500 - 1800 RPM, 78.86 CFM)\nTubing: 400mm Braided Ultra-Low Evaporation Rubber', 'Socket Support: Intel LGA 1700/1200/115X, AMD Socket AM5 & AM4\nHeader: 1x Internal USB 2.0 header required', 'images/pc-aio-nzxt.jpg', 'fc/nzxt-kraken-elite-360-rgb-aio-liquid-cpu-cooler-details.docx', 'in_stock', 1, 260),
(37, 3, 'Noctua NH-D15 chromax.black Dual-Tower CPU Air Cooler', 'noctua-nh-d15-chromax-black-dual-tower-cpu-air-cooler', 'Noctua', 'PC / Cooling', 32000.00, 37000.00, 'Legendary dual-tower flagship air cooler in sleek stealth all-black finish with two whisper-quiet NF-A15 140mm fans.', 'The NH-D15 chromax.black is an all-black version of Noctua''s award-winning flagship model. With dual tower heatsinks, 6 copper heatpipes, and dual NF-A15 PWM fans, it matches the performance of 240mm liquid AIOs while offering near-zero maintenance and silent acoustics.', 'Cooler Type: Dual-Tower CPU Air Cooler\nColor: Stealth chromax.black\nHeatpipes: 6x Copper Heatpipes with soldered joints\nFans: 2x NF-A15 HS-PWM 140mm Premium Fans\nMax Fan Speed: 1500 RPM (1200 RPM with L.N.A.)\nAcoustical Noise: Max 24.6 dB(A)\nTotal Weight: 1320g', 'CPU Clearance: 165mm height clearance inside PC chassis\nSocket Support: Intel LGA1700/1200/115x, AMD AM5 & AM4', 'images/pc-cooler-noctua.jpg', 'fc/noctua-nh-d15-chromax-black-dual-tower-cpu-air-cooler-details.docx', 'in_stock', 0, 155),
(38, 3, 'ASUS ROG Swift OLED PG27AQDM 27-Inch 240Hz 1440p Gaming Monitor', 'asus-rog-swift-oled-pg27aqdm-27-inch-240hz-1440p-gaming-monitor', 'ASUS', 'PC / Display', 285000.00, 310000.00, '27-inch QHD OLED gaming monitor boasting 240Hz refresh rate, 0.03ms response time, custom heatsink, and 99% DCI-P3.', 'Elevate your visual reflexes with the ASUS ROG Swift OLED PG27AQDM. Features a 26.5-inch QHD (2560 x 1440) OLED panel with lightning 240Hz refresh rate and an astonishing 0.03ms gray-to-gray response time. Equipped with a custom heatsink and intelligent voltage optimization for OLED longevity and true HDR deep blacks.', 'Screen Size: 26.5-inch OLED Display\nResolution: 2560 x 1440 (QHD)\nRefresh Rate: 240Hz\nResponse Time: 0.03ms (GTG)\nPeak Brightness: 1000 nits (3% HDR Window)\nColor Gamut: 99% DCI-P3, 135% sRGB\nConnectivity: 1x DisplayPort 1.4, 2x HDMI 2.0, USB 3.2 Hub\nFeatures: G-SYNC Compatible, Custom Heatsink, Uniform Brightness', 'Graphics Card with DisplayPort 1.4 or HDMI output\nVESA Wall Mount 100x100mm supported', 'images/pc-monitor-asus.jpg', 'fc/asus-rog-swift-oled-pg27aqdm-27-inch-240hz-1440p-gaming-monitor-details.docx', 'in_stock', 1, 370),
(39, 3, 'Razer Huntsman V3 Pro Tenkeyless Analog Optical Keyboard', 'razer-huntsman-v3-pro-tenkeyless-analog-optical-keyboard', 'Razer', 'PC / Peripheral', 59000.00, 66000.00, 'Tournament esports keyboard with 2nd Gen Analog Optical Switches, Rapid Trigger mode, and 0.1 to 4.0mm adjustable actuation.', 'Dominate competitive FPS games with the Razer Huntsman V3 Pro TKL. Unleash Rapid Trigger mode for ultra-fast repeated keystrokes, adjustable actuation from 0.1mm to 4.0mm, textured doubleshot PBT keycaps, and an aircraft-grade aluminum top plate.', 'Switch Type: Razer Gen-2 Analog Optical Switches\nKey Feel: Linear and Clicky Adjustable\nActuation Range: 0.1 mm to 4.0 mm\nRapid Trigger: Adjustable Rapid Trigger Mode\nForm Factor: Tenkeyless (TKL)\nKeycaps: Textured Doubleshot PBT Keycaps\nLighting: Razer Chroma RGB Per-Key Illumination\nOnboard Storage: Up to 6 profiles', 'PC with USB Type-A port\nWindows 10/11 64-bit for Razer Synapse software', 'images/pc-keyboard-razer.jpg', 'fc/razer-huntsman-v3-pro-tenkeyless-analog-optical-keyboard-details.docx', 'in_stock', 0, 180),
(40, 3, 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse', 'logitech-g-pro-x-superlight-2-wireless-gaming-mouse', 'Logitech', 'PC / Peripheral', 43000.00, 48000.00, 'Pro esports icon weighing only 60 grams with HERO 2 32,000 DPI sensor, LIGHTFORCE hybrid optical switches, and 4000Hz polling.', 'The Logitech G PRO X SUPERLIGHT 2 is the choice of champions in competitive esports. Weighing just 60 grams, it features LIGHTFORCE hybrid optical-mechanical switches, sub-micron HERO 2 sensor tracking up to 32,000 DPI, zero-additive PTFE feet, and up to 95 hours of battery life on a single charge.', 'Weight: Ultra-lightweight 60 grams\nSensor: HERO 2 Optical Sensor\nResolution: 100 - 32,000 DPI\nMax Acceleration: > 40G\nMax Speed: > 500 IPS\nPolling Rate: Up to 4000Hz (0.25 ms response time)\nBattery Life: Up to 95 hours continuous motion\nSwitches: LIGHTFORCE Hybrid Optical-Mechanical', 'PC with Windows 10 or later\nUSB port for LIGHTSPEED wireless receiver or charging cable', 'images/pc-mouse-logitech.jpg', 'fc/logitech-g-pro-x-superlight-2-wireless-gaming-mouse-details.docx', 'in_stock', 1, 295);
