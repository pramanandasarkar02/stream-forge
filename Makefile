GO := go
BINARY_NAME := stream-forge
SRC_DIR := ./cmd
BUILD_DIR := ./bin
VERSION := 1.0.0
MAIN_FILE := $(SRC_DIR)/main.go


.PHONY: all
all: build 

.PHONY: build
build: 
	@echo "Building ${BINARY_NAME}..."
	@mkdir -p $(BUILD_DIR)
	$(GO) build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_FILE)

.PHONY: run
run:
	@echo "Running $(BINARY_NAME)..."
	$(GO) run $(MAIN_FILE)

.PHONY: test
test: 
	@echo "Running test..."
	$(GO) test ./... -v 

.PHONY: clean
clean: 
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)

.PHONY: deps
deps: 
	@echo "Installing dependencies..."
	$(GO) mod tidy
	$(GO) mod download

.PHONY: fmt
fmt:
	@echo "Formatting code..."
	$(GO) fmt ./...

.PHONY: lint
lint:
	@echo "Running linter..."
	golangci-lint run

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build       - Build the binary"
	@echo "  make run         - Run the application"
	@echo "  make test        - Run tests"
	@echo "  make clean       - Remove build artifacts"
	@echo "  make deps        - Install dependencies"
	@echo "  make fmt         - Format the code"
	@echo "  make lint        - Run linter (requires golangci-lint)"
	@echo "  make help        - Show this help message"