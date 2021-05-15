all: build clean test start
build:
	docker-compose build
start: 
	docker-compose down
	docker volume prune
	docker-compose up -d mongo
	docker-compose run addon start
test: mongo
	docker-compose run addon test --detectOpenHandles
test-ci: mongo
	docker-compose run addon test -- --watchAll=false --forceExit
mongo:
	docker-compose up -d mongo
clean:
	docker volume prune
prune: 
	docker-compose down