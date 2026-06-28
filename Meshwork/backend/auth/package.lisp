(defpackage :meshwork.auth
  (:use :cl :clredis)
  (:export #:session-user-id
           #:revoke-session
           #:session-user-id*))
