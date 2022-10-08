-- ENABLED EVENT SCHEDULE FOR MYSQL 
-- IF USE AWS RDS USE CUSTOM GROUP OPTIONS https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithOptionGroups.html
SET GLOBAL event_scheduler="ON"

-- REMEMBER VALUE OF FUNCTION DAYOFWEEK IN MYSQL
-- https://www.w3resource.com/mysql/date-and-time-functions/mysql-dayofweek-function.php

-- CREATE STORE PROCEDURE OF ABSENTS OF USER OF DAY
DROP PROCEDURE IF EXISTS REGISTER_ABSENT_ATTENDANCE_BY_USER;
DELIMITER //
CREATE PROCEDURE `REGISTER_ABSENT_ATTENDANCE_BY_USER` ()
BEGIN
  SET @ATTENDANCE_ID:= (SELECT DATE_FORMAT( convert_tz(now(),@@session.time_zone,'-05:00') ,"%Y%m%d") FROM DUAL);
	INSERT IGNORE  INTO `attendance`  (`attendance`.`codUser`, `attendance`.`id`,    `attendance`.`description`, `attendance`.`isAbsent` ,`attendance`.`isLater`  ,`attendance`.`isActive`,`attendance`.`entryTime`,`attendance`.`exitTime`,`attendance`.`date`) 
    SELECT SCHEDULE_VALID_BY_USER.CODUSER ,  @ATTENDANCE_ID, "User is absent" , 1 , 0  ,  0, @ATTENDANCE_ID,  @ATTENDANCE_ID,  @ATTENDANCE_ID  FROM
    (
    SELECT U.id AS 'CODUSER', 
    CASE 
    WHEN   (MONDAY = 1 AND DAYOFWEEK(NOW())=2) THEN 'TRUE'
    WHEN   (TUESDAY = 1 AND DAYOFWEEK(NOW())=3) THEN 'TRUE'
    WHEN   (WEDNESDAY = 1 AND DAYOFWEEK(NOW())=4) THEN 'TRUE'
    WHEN   (THURSDAY = 1 AND DAYOFWEEK(NOW())=5) THEN 'TRUE'
    WHEN   (FRIDAY = 1 AND DAYOFWEEK(NOW())=6) THEN 'TRUE'
    WHEN   (SATURDAY = 1 AND DAYOFWEEK(NOW())=7) THEN 'TRUE'
    WHEN   (SUNDAY = 1 AND DAYOFWEEK(NOW())=1) THEN 'TRUE' 
    ELSE "FALSE"
    END AS 'IS_ENABLED'
    FROM `schedule` S
    JOIN `user` U  ON U.codSchedule = S.id) SCHEDULE_VALID_BY_USER
    WHERE SCHEDULE_VALID_BY_USER.IS_ENABLED ='TRUE';
END//
DELIMITER ;

 
-- CREATE STORE PROCEDURE FOR REGISTER DAYOFF ATTENDANCE BY USER
DROP PROCEDURE IF EXISTS REGISTER_DAYOFF_ATTENDANCE_BY_USER;
DELIMITER //
CREATE PROCEDURE `REGISTER_DAYOFF_ATTENDANCE_BY_USER` ()
BEGIN
  SET @ATTENDANCE_ID:= (SELECT DATE_FORMAT( convert_tz(now(),@@session.time_zone,'-05:00') ,"%Y%m%d") FROM DUAL);
	INSERT IGNORE  INTO `attendance`  (`attendance`.`codUser`, `attendance`.`id`,    `attendance`.`description`, `attendance`.`isAbsent` ,`attendance`.`isLater`  ,`attendance`.`isActive`,`attendance`.`isDayOff`,`attendance`.`entryTime`,`attendance`.`exitTime`,`attendance`.`date`) 
    SELECT SCHEDULE_VALID_BY_USER.CODUSER ,  @ATTENDANCE_ID, "User is dayOff" , 0 , 0  ,  0 , 1 , @ATTENDANCE_ID,  @ATTENDANCE_ID,  @ATTENDANCE_ID FROM
    (
    SELECT U.id AS 'CODUSER', 
    CASE 
    WHEN   (MONDAY = 1 AND DAYOFWEEK(NOW())=2) THEN 'TRUE'
    WHEN   (TUESDAY = 1 AND DAYOFWEEK(NOW())=3) THEN 'TRUE'
    WHEN   (WEDNESDAY = 1 AND DAYOFWEEK(NOW())=4) THEN 'TRUE'
    WHEN   (THURSDAY = 1 AND DAYOFWEEK(NOW())=5) THEN 'TRUE'
    WHEN   (FRIDAY = 1 AND DAYOFWEEK(NOW())=6) THEN 'TRUE'
    WHEN   (SATURDAY = 1 AND DAYOFWEEK(NOW())=7) THEN 'TRUE'
    WHEN   (SUNDAY = 1 AND DAYOFWEEK(NOW())=1) THEN 'TRUE' 
    ELSE "FALSE"
    END AS 'IS_ENABLED'
    FROM `schedule` S
    JOIN `user`  U  ON U.codSchedule = S.id) SCHEDULE_VALID_BY_USER
    WHERE SCHEDULE_VALID_BY_USER.IS_ENABLED ='FALSE';
END//
DELIMITER ;


-- CREATE STORE PROCEDURE FOR PERMISSIONS OF USERS 
DROP PROCEDURE IF EXISTS REGISTER_PERMISSIONS_OF_USERS;
DELIMITER //
CREATE PROCEDURE `REGISTER_PERMISSIONS_OF_USERS` ()
BEGIN
    SET @CURRENT_DAY := (SELECT DATE_FORMAT( convert_tz(now(),@@session.time_zone,'-05:00') ,"%Y-%m-%d") FROM DUAL);
    SET @ATTENDANCE_ID:= (SELECT DATE_FORMAT( convert_tz(now(),@@session.time_zone,'-05:00') ,"%Y%m%d") FROM DUAL);
    INSERT IGNORE  INTO `attendance`  (`attendance`.`codUser`, `attendance`.`id`,    `attendance`.`description`, `attendance`.`isAbsent` ,`attendance`.`isLater`  ,`attendance`.`isActive`,`attendance`.`isDayOff`,`attendance`.`isLicence`) 
    SELECT CODUSER ,  @ATTENDANCE_ID, "User is licence" , 0 , 0  ,  0 , 0, 1  from licence 
    where @CURRENT_DAY <= date(dateEnd) AND  @CURRENT_DAY >=date(dateInit);
END//
DELIMITER;

-- CHECK CREATION OF STORE PROCEDURE 
SHOW PROCEDURE STATUS;



-- CREATION JOB REGISTER ABSENTS  OF USERS
DROP EVENT IF EXISTS JOB_REGISTER_ABSENT_ATTENDANCE_BY_USER;
CREATE EVENT JOB_REGISTER_ABSENT_ATTENDANCE_BY_USER
  ON SCHEDULE
    EVERY 1 DAY
    STARTS (TIMESTAMP(CURRENT_DATE)  + INTERVAL 23 HOUR + INTERVAL 25 MINUTE  )
  DO
     CALL REGISTER_ABSENT_ATTENDANCE_BY_USER()


-- CREATION JOB REGISTER DAYOFF OF USERS
DROP EVENT IF EXISTS JOB_REGISTER_DAYOFF_ATTENDANCE_BY_USER;
CREATE EVENT JOB_REGISTER_DAYOFF_ATTENDANCE_BY_USER
  ON SCHEDULE
    EVERY 1 DAY
    STARTS (TIMESTAMP(CURRENT_DATE)  + INTERVAL 23 HOUR )
  DO
     CALL REGISTER_DAYOFF_ATTENDANCE_BY_USER()

-- CREATION JOB REGISTER PERMISSIONS OF USERS
DROP EVENT IF EXISTS JOB_REGISTER_PERMISSIONS_OF_USERS;
CREATE EVENT JOB_REGISTER_PERMISSIONS_OF_USERS
  ON SCHEDULE
    EVERY 1 DAY
    STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 5 MINUTE   )
  DO
     CALL REGISTER_PERMISSIONS_OF_USERS()

-- CHECK CREATION OF JOBS
SHOW EVENTS;
