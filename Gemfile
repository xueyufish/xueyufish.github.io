source "https://rubygems.org"

# Jekyll 核心宝石
gem "jekyll", "~> 4.3"

# 分页插件
gem "jekyll-paginate"

# Windows 和 JRuby 兼容性
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 性能监控
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock http_parser.rb to v0.6.x for JRuby
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
