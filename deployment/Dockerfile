# Build Stage
FROM node:20-slim AS node_builder
WORKDIR /app
COPY package*.json ./
COPY *config.js* ./
RUN npm install
COPY resources/ resources/
COPY public/ public/
RUN npm run build

# PHP Stage
FROM php:8.2-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    nginx \
    supervisor

# Install PHP extensions and dependencies on Alpine
RUN apk update && \
    apk add --no-cache \
        oniguruma-dev \
        libxml2-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libwebp-dev \
        icu-dev \
        libzip-dev && \
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && \
    docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        mbstring \
        xml \
        ctype \
        bcmath \
        intl \
        opcache \
        gd \
        zip && \
    apk del --no-cache \
        oniguruma-dev \
        libxml2-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libwebp-dev \
        icu-dev \
        libzip-dev


# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files
COPY composer.* ./
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-scripts

# Copy application
COPY . .
COPY --from=node_builder /app/public/build public/build

# Copy configurations
COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY deployment/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY deployment/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# Create required directories and files
RUN mkdir -p /var/run/php && \
    mkdir -p /var/log/supervisor

# Expose port
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]