#!/bin/sh
set -e

# Up to version 2.5.0 the logs of the contacts service were written into a
#  file that was not picked up by logrotate.
# The service is stable and we can safely discard any logs.
rm -vf /var/log/overleaf/contacts
