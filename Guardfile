# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'puma', port: 4567 do
  watch('Gemfile.lock')
  watch(%r{^config|lib|api/.*})
  watch('app.rb')
end

guard 'coffeescript', :input => 'public/js', source_map: true, source_root: ""
