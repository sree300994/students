class Message < ActiveRecord::Base
	validates_presence_of :body
	has_attached_file :video,
              styles: 
              {
                medium: 
                {
                  geometry: '640x480',
                  format: 'mp4'
                },
                thumb: 
                {
                  geometry: '160x120',
                  format: 'jpg',
                  time: 10
                }
              }, processors: [:transcoder]

	validates_attachment_content_type :video, content_type: %r{\Avideo\/.*\z}
	# validates :message_not_blank_when_submitted

	# def message_not_blank_when_submitted
	#   if body.empty? && !video?
	#     errors.add(:body, 'must not be blank upon submit')
	#   end
	# end
end
