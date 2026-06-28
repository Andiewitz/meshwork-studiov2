(in-package :meshwork.auth)

(defvar *redis-host* "127.0.0.1"
  "Redis server host.")

(defvar *redis-port* 6379
  "Redis server port.")

(defvar *redis-password* nil
  "Redis server password. Nil if no auth required.")

(defun redis-connection-args ()
  "Return the Redis connection argument list."
  (let ((args (list :host *redis-host*
                    :port *redis-port*)))
    (when *redis-password*
      (push *redis-password* args)
      (push :auth args))
    args))

(defmacro with-redis-connection ((&rest args) &body body)
  "Establish a Redis connection for the duration of BODY."
  `(clredis:with-connection (,@(or args (redis-connection-args)))
     ,@body))
