FROM golang:1.15.7-buster
COPY ./server/table-booking /go/
RUN mkdir -p /go/ui
COPY ./frontend/build/ /go/ui/
RUN mkdir -p /go/env
COPY ./server/env/ /go/env/
CMD ["./table-booking"]
EXPOSE 8090

