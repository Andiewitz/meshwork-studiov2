(in-package :meshwork.auth)

(defun session-user-id (session-key)
  "Retrieve the user-id from a session stored in Redis."
  (with-redis-connection ()
    (let ((user-id (clredis:rediget (format nil "session:~a" session-key))))
      (when user-id
        (parse-integer user-id)))))

(defun session-user-id* (session-key)
  "Like SESSION-USER-ID, but signals an error if the session is not found."
  (or (session-user-id session-key)
      (error "No session found for key: ~a" session-key)))

(defun revoke-session (session-key)
  "Revoke a session by deleting it from Redis."
  (with-redis-connection ()
    (clredis:reddel (format nil "session:~a" session-key))))
